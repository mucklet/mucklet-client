// Configuration for the site

module.exports = {
	APP_VERSION: '0', // Overwritten by version in package.json
	APP_TITLE: "Mucklet",
	APP_DESCRIPTION: "A textual world of role play. Create a character, wake them up, and join in.",

	API_HOST_PATH: 'wss://api.mucklet.com/',
	API_WEBRESOURCE_PATH: 'https://api.mucklet.com/api/',
	API_IDENTITY_PATH: 'https://auth.mucklet.com/',
	API_CROSS_ORIGIN: true,

	AUTH_LOGIN_URL: '/login',
	AUTH_LOGOUT_URL: 'https://auth.mucklet.com/logout',
	AUTH_AUTHENTICATE_URL: 'https://auth.mucklet.com/authenticate?noredirect',
	AUTH_LOGIN_RID: 'identity',
	AUTH_AUTHENTICATE_RID: 'identity',

	HUB_PATH: 'https://mucklet.com/',
};
