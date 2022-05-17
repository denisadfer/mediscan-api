const { nanoid } = require('nanoid');
const {
	selectUser,
	insertUser,
	selectPosts,
	insertHistory,
	selectHistory,
} = require('./connectdb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcrypt');

const addUser = async (request, h) => {
	try {
		const { username, email, password } = request.payload;
		const hashedPassword = await bcrypt.hash(password, 10);
		insertUser(username, email, hashedPassword);
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
		expiresIn: '90m',
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
			const accessToken = generateAccessToken({ userId: user.userId });
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
			const user = { userId: currentUser.id };
			const accessToken = generateAccessToken(user);
			const refreshToken = generateRefreshToken(user);
			refreshTokens.push(refreshToken);
			return h
				.response({
					userId: currentUser.id,
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

const addHistory = (request, h) => {
	authenticateToken(request, h, () => {
		return;
	});
	const user_id = request.user.userId;
	const { result, img_url } = request.payload;
	insertHistory(user_id, result, img_url);
	return h
		.response({
			status: 'success',
			message: 'history added',
		})
		.code(200);
};

const getHistoryByUserId = (request, h) => {
	authenticateToken(request, h, () => {
		return;
	});
	const sh = selectHistory._results[0];
	return h
		.response(sh.filter((h) => h.user_id === request.user.userId))
		.code(200);
};

const getPostByEmail = (request, h) => {
	authenticateToken(request, h, () => {
		return;
	});
	const sp = selectPosts._results[0];
	return h
		.response(sp.filter((post) => post.owner === request.user.email))
		.code(200);
};

module.exports = {
	authenticateToken,
	getPostByEmail,
	addUser,
	token,
	login,
	logout,
	addHistory,
	getHistoryByUserId,
};
