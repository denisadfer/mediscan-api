const {
	addUser,
	login,
	logout,
	addHistory,
	getHistoryByUserId,
} = require('./handler');

const routes = [
	{
		method: 'GET',
		path: '/test',
		handler: (request, h) => {
			return 'hello world';
		},
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
