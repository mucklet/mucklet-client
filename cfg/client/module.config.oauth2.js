const config = {
	api: {
		hostUrl: 'ws://localhost:8080/',
		webResourcePath: 'http://localhost:8080/api/',
	},
	login: {
		oauth2Url: '/auth/oauth2/login',
		oauth2LogoutUrl: '/auth/oauth2/logout',
		authenticateUrl: '/auth/authenticate',
	},
	charPing: {
		method: 'ws',
	},
	confirmClose: { active: false },
};

export default config;
