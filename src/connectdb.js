var mysql = require('mysql');

var con = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'mediscan',
});

const conn = con.connect(function (err) {
	if (err) throw err;
	console.log('Connected to Database!');
});

const select = con.query('SELECT * FROM test', function (err, result, fields) {
	if (err) throw err;
	return result;
});

const insert = (id, name, address, phone) => {
	con.query(
		'INSERT INTO test (id, name, address, phone) VALUES (?,?, ?, ?)',
		[id, name, address, phone],
		function (err, result) {
			if (err) throw err;
			return result;
		}
	);
};

const insertUser = (username, password) => {
	con.query(
		'INSERT INTO users (username, password) VALUES (?,?)',
		[username, password],
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

module.exports = {
	select,
	insert,
	insertUser,
	selectUser,
};
