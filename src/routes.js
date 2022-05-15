const {
	getPostByEmail,
	addUser,
	token,
	login,
	logout,
	addHistory,
	getHistoryByUserId,
} = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/token',
		handler: token,
	},
	{
		method: 'POST',
		path: '/users',
		handler: addUser,
	},
	{
		method: 'POST',
		path: '/login',
		handler: login,
	},
	{
		method: 'DELETE',
		path: '/logout',
		handler: logout,
	},
	{
		method: 'GET',
		path: '/posts',
		handler: getPostByEmail,
	},
	{
		method: 'POST',
		path: '/history',
		handler: addHistory,
	},
	{
		method: 'GET',
		path: '/history',
		handler: getHistoryByUserId,
	},
];

module.exports = routes;
