const {
	addData,
	getAllDatas,
	getDataById,
	getPostByUsername,
	addUser,
} = require('./handler');

const routes = [
	{
		method: 'POST',
		path: '/users',
		handler: addUser,
	},
	{
		method: 'GET',
		path: '/posts',
		handler: getPostByUsername,
	},
	{
		method: 'POST',
		path: '/datas',
		handler: addData,
	},
	{
		method: 'GET',
		path: '/datas',
		handler: getAllDatas,
	},
	{
		method: 'GET',
		path: '/datas/{id}',
		handler: getDataById,
	},
];

module.exports = routes;
