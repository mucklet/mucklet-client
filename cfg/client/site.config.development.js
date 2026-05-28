// Configuration for the site

module.exports = {
	APP_ISTEMPLATE: false,
	APP_VERSION: '0', // Overwritten by version in package.json
	APP_TITLE: "Dev Realm",
	APP_DESCRIPTION: "A textual world of role play. Create a character, wake them up, and join in.",
	APP_ROOT: '/',
	APP_IMAGE: null,
	APP_ICON: null,
	APP_THEME: {
		colors: {
			base: '#161926',
			accent: '#c1a657',
			contrast: '#fffcf2',
			muted: '#93969f',
			danger: '#c96036',
			action: '#4a9fc3',
		},
	},

	API_HOST_PATH: 'ws://localhost:8080/',
	API_WEBRESOURCE_PATH: 'http://localhost:8080/api/',
	API_FILE_PATH: 'http://localhost:6452/',
	API_IDENTITY_PATH: '/identity/',
	API_CROSS_ORIGIN: false,

	AUTH_LOGIN_URL: '/auth/oauth2/login',
	AUTH_LOGOUT_URL: '/auth/oauth2/logout',
	AUTH_AUTHENTICATE_URL: '/auth/authenticate',
	AUTH_LOGIN_RID: 'auth',
	AUTH_AUTHENTICATE_RID: 'auth',

	HUB_PATH: 'http://localhost:6460/',
};
