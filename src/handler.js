const {
	selectUser,
	insertUser,
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
		const su = selectUser._results[0];
		const currentUserUsername = su.filter((u) => u.username === username)[0];
		const currentUserEmail = su.filter((u) => u.email === email)[0];
		if (currentUserUsername !== undefined) {
			return h
				.response({
					status: 'fail',
					message: 'Username already exists',
				})
				.code(403);
		} else if (currentUserEmail !== undefined) {
			return h
				.response({
					status: 'fail',
					message: 'Email already exists',
				})
				.code(403);
		} else {
			insertUser(username, email, hashedPassword);
			return h.response({
				status: 'success',
				message: 'user added',
			});
		}
	} catch (error) {
		return h.response({
			status: 'fail',
			message: 'user not added',
		});
	}
};

function generateAccessToken(user) {
	return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: '1h',
	});
}

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
			return h
				.response({
					status: 'success',
					message: 'login success',
					userId: currentUser.id,
					username: currentUser.username,
					accessToken: accessToken,
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
	const token = request.payload.token;
	const jwtlogout = jwt.sign(token, '', { expiresIn: 1 }, (logout, err) => {
		if (err) throw err;
		return h.response().code(204);
	});
	return jwtlogout;
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

const addHistory = async (request, h) => {
	try {
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
			.code(201);
	} catch (error) {
		return h
			.response({ status: 'fail', message: 'history not added' })
			.code(404);
	}
};

const getHistoryByUserId = async (request, h) => {
	try {
		authenticateToken(request, h, () => {
			return;
		});
		const sh = selectHistory._results[0];
		return h
			.response(sh.filter((h) => h.user_id == request.user.userId))
			.code(200);
	} catch (error) {
		return h
			.response({ status: 'fail', message: 'history not found' })
			.code(404);
	}
};

module.exports = {
	authenticateToken,
	addUser,
	login,
	logout,
	addHistory,
	getHistoryByUserId,
};
