// Configuration for the site

module.exports = {
	APP_VERSION: '0', // Overwritten by version in package.json
	APP_TITLE: "Docker Mucklet",
	APP_DESCRIPTION: "A textual world of role play. Create a character, wake them up, and join in.",

	API_HOST_PATH: 'ws://api.mucklet.localhost/',
	API_WEBRESOURCE_PATH: 'http://api.mucklet.localhost/api/',
	API_FILE_PATH: 'http://file.mucklet.localhost/',
	API_IDENTITY_PATH: '/dockerauth/',
	API_CROSS_ORIGIN: true,

	AUTH_LOGIN_URL: '/login',
	AUTH_LOGOUT_URL: '/dockerauth/logout',
	AUTH_AUTHENTICATE_URL: '/dockerauth/authenticate?noredirect',
	AUTH_LOGIN_RID: 'identity',
	AUTH_AUTHENTICATE_RID: 'identity',

	HUB_PATH: 'http://mucklet.localhost/',
};
