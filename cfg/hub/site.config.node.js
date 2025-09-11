// Configuration for the site

module.exports = {
	APP_VERSION: '0', // Overwritten by version in package.json
	APP_TITLE: "Mucklet node",
	APP_DESCRIPTION: "Mucklet being running through a node proxy.",

	API_HOST_PATH: 'ws://api.mucklet.localhost/',
	API_WEBRESOURCE_PATH: 'http://api.mucklet.localhost/api/',
	API_IDENTITY_PATH: 'http://auth.mucklet.localhost/',
	API_CROSS_ORIGIN: true,

	AUTH_LOGIN_URL: '/login',
	AUTH_LOGOUT_URL: 'http://auth.mucklet.localhost/logout',
	AUTH_AUTHENTICATE_URL: 'http://auth.mucklet.localhost/authenticate?noredirect',
	AUTH_LOGIN_RID: 'identity',
	AUTH_AUTHENTICATE_RID: 'identity',

	HUB_PATH: 'http://localhost:6460/',
};
