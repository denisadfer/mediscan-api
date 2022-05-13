const { nanoid } = require('nanoid');
const { select, insert, selectUser, insertUser } = require('./connectdb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');

const addData = (request, h) => {
	const { name, address, phone } = request.payload;
	const id = nanoid(16);
	insert(id, name, address, phone);
	const response = h.response({
		status: 'success',
		message: 'data inserted',
		data: {
			userId: id,
		},
	});
	response.code(201);
	return response;
};

const getAllDatas = (request, h) => {
	const response = h.response({
		status: 'success',
		message: 'get all data from test table',
		data: {
			user: select._results[0],
		},
	});
	response.code(200);
	return response;
};

const getDataById = (request, h) => {
	const { id } = request.params;
	const sr = select._results[0];
	const user = sr.filter((d) => d.id == id)[0];
	if (user !== undefined) {
		return h
			.response({
				status: 'success',
				message: 'get data by id from test table',
				data: {
					user,
				},
			})
			.code(200);
	} else {
		return h
			.response({
				status: 'fail',
				message: 'data not found',
			})
			.code(404);
	}
};

function authenticateToken(request, h, next) {
	const authHeader = request.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1];
	if (token === null) {
		return h.response({ status: 'fail', message: 'token not found' }).code(401);
	}
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err)
			return h
				.response({ status: 'forbidden', message: 'token not valid' })
				.code(403);
		request.user = user;
		next();
	});
}

const posts = [
	{
		username: 'Denis',
		title: 'My first post',
	},
	{
		username: 'Jim',
		title: 'My second post',
	},
];

const getPostByUsername = (request, h) => {
	authenticateToken(request, h, () => {
		return h.response(posts);
	});
	return h
		.response(posts.filter((post) => post.username === request.user.name))
		.code(200);
};

const addUser = async (request, h) => {
	try {
		const { username, password } = request.payload;
		const hashedPassword = await bcrypt.hash(password, 10);
		insertUser(username, hashedPassword);
		return h.response({
			status: 'success',
			message: 'user added',
		});
	} catch (error) {
		return h.response({
			status: 'fail',
			message: 'user not added',
		});
	}
};

let refreshTokens = [];

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '15s',
	});
}

function generateRefreshToken(user) {
	return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
}

const token = (request, h) => {
	const refreshToken = request.payload.token;
	if (refreshToken === null) {
		return h.response({ status: 'fail', message: 'token not found' }).code(401);
	}
	if (!refreshTokens.includes(refreshToken)) {
		return h
			.response({ status: 'fail', message: 'token already used' })
			.code(403);
	}
	const newAccessToken = jwt.verify(
		refreshToken,
		process.env.REFRESH_TOKEN_SECRET,
		(err, user) => {
			if (err)
				return h
					.response({ status: 'fail', message: 'token invalid' })
					.code(403);
			const accessToken = generateAccessToken({ name: user.name });
			return h.response({ accessToken: accessToken }).code(200);
		}
	);
	return newAccessToken;
};

const login = async (request, h) => {
	const { username, password } = request.payload;
	const su = selectUser._results[0];
	const currentUser = su.filter((u) => u.username === username)[0];
	if (currentUser === undefined) {
		return h
			.response({ status: 'fail', message: 'username not found' })
			.code(404);
	}
	try {
		if (await bcrypt.compare(password, currentUser.password)) {
			const user = { name: username };
			const accessToken = generateAccessToken(user);
			const refreshToken = generateRefreshToken(user);
			refreshTokens.push(refreshToken);
			return h
				.response({
					username: currentUser.username,
					accessToken: accessToken,
					refreshToken: refreshToken,
				})
				.code(200);
		} else {
			return h
				.response({ status: 'fail', message: 'password not valid' })
				.code(403);
		}
	} catch {
		return h.response({ status: 'fail' }).code(404);
	}
};

const logout = (request, h) => {
	refreshTokens = refreshTokens.filter(
		(token) => token !== request.payload.token
	);
	return h.response().code(204);
};

module.exports = {
	addData,
	getAllDatas,
	getDataById,
	authenticateToken,
	getPostByUsername,
	addUser,
	token,
	login,
	logout,
};
