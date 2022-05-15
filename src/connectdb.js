var mysql = require('mysql');
require('dotenv').config();

var con = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
});

con.connect(function (err) {
	if (err) throw err;
	console.log('Connected to Database!');
});

const insertUser = (username, email, password) => {
	con.query(
		'INSERT INTO users (username, email, password) VALUES (?,?,?)',
		[username, email, password],
		function (err, result) {
			if (err) throw err;
			return result;
		}
	);
};

const selectUser = con.query(
	'SELECT * FROM users',
	function (err, result, fields) {
		if (err) throw err;
		return result;
	}
);

const selectPosts = con.query(
	'SELECT * FROM posts',
	function (err, result, fields) {
		if (err) throw err;
		return result;
	}
);

const insertHistory = (user_id, result, img_url) => {
	con.query(
		'INSERT INTO history (user_id, result, img_url) VALUES (?,?,?)',
		[user_id, result, img_url],
		function (err, result) {
			if (err) throw err;
			return result;
		}
	);
};

const selectHistory = con.query(
	'SELECT * FROM history',
	function (err, result, fields) {
		if (err) throw err;
		return result;
	}
);

module.exports = {
	insertUser,
	selectUser,
	selectPosts,
	insertHistory,
	selectHistory,
};
