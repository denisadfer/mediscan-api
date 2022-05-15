const { getPostByEmail, addUser } = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/users',
		handler: addUser,
	},
	{
		method: 'GET',
		path: '/posts',
		handler: getPostByEmail,
	},
];

module.exports = routes;
