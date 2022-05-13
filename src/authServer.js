const Hapi = require('@hapi/hapi');
const { token, login, logout } = require('./handler');

const init = async () => {
	const server = Hapi.server({
		port: 4000,
		host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
		routes: {
			cors: {
				origin: ['*'],
			},
		},
	});

	server.route([
		{
			method: 'POST',
			path: '/token',
			handler: token,
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
	]);

	await server.start();
	console.log(`Server running on ${server.info.uri}`);
};

init();
