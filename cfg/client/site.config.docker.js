// Configuration for the site

module.exports = {
	APP_ISTEMPLATE: false,
	APP_VERSION: '0', // Overwritten by version in package.json
	APP_TITLE: "Docker Wolfery",
	APP_DESCRIPTION: "A textual world of role play. Create a character, wake them up, and join in.",

	API_HOST_PATH: 'ws://api.mucklet.localhost/',
	API_WEBRESOURCE_PATH: 'http://api.mucklet.localhost/api/',
	API_FILE_PATH: 'http://file.mucklet.localhost/',
	API_CROSS_ORIGIN: false,

	AUTH_LOGIN_URL: '/auth/oauth2/login',
	AUTH_LOGOUT_URL: '/auth/oauth2/logout',
	AUTH_AUTHENTICATE_URL: '/auth/authenticate',
	AUTH_LOGIN_RID: 'auth',
	AUTH_AUTHENTICATE_RID: 'auth',

	HUB_PATH: 'http://mucklet.localhost/',
};
