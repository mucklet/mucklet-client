// Configuration for the site

module.exports = {
	APP_ISTEMPLATE: false,
	APP_VERSION: '0', // Overwritten by version in package.json
	APP_TITLE: "Wolfery",
	APP_DESCRIPTION: "A textual world of role play. Create a character, wake them up, and join in.",

	API_HOST_PATH: 'wss://api.wolfery.com/',
	API_WEBRESOURCE_PATH: 'https://api.wolfery.com/api/',
	API_FILE_PATH: 'https://file.wolfery.com/',
	API_CROSS_ORIGIN: true,

	AUTH_LOGIN_URL: '/auth/oauth2/login',
	AUTH_LOGOUT_URL: '/auth/oauth2/logout',
	AUTH_AUTHENTICATE_URL: '/auth/authenticate',
	AUTH_LOGIN_RID: 'auth',
	AUTH_AUTHENTICATE_RID: 'auth',

	HUB_PATH: 'https://mucklet.com/',
};
