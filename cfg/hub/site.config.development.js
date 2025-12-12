// Configuration for the site

module.exports = {
	APP_VERSION: '0', // Overwritten by version in package.json
	APP_TITLE: "Dev Mucklet",
	APP_DESCRIPTION: "A textual world of role play. Create a character, wake them up, and join in.",

	API_HOST_PATH: 'ws://localhost:8080/',
	API_WEBRESOURCE_PATH: 'http://localhost:8080/api/',
	API_FILE_PATH: 'http://localhost:6452/',
	API_IDENTITY_PATH: '/identity/',
	API_CROSS_ORIGIN: true,

	AUTH_LOGIN_URL: '/login',
	AUTH_LOGOUT_URL: '/identity/logout',
	AUTH_AUTHENTICATE_URL: '/identity/authenticate?noredirect',
	AUTH_LOGIN_RID: 'identity',
	AUTH_AUTHENTICATE_RID: 'identity',

	HUB_PATH: 'http://localhost:6460/',
};
