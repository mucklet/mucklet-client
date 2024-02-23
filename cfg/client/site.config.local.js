// Configuration for the site

module.exports = {
	APP_ISTEMPLATE: true,
	APP_VERSION: '0', // Overwritten by version in package.json
	APP_TITLE: '', // Set in template
	APP_DESCRIPTION: '', // Set in template
	APP_ROOT: '', // Set in template

	API_HOST_PATH: '', // Set in template
	API_WEBRESOURCE_PATH: '', // Set in template
	API_FILE_PATH: '', // Set in template
	API_CROSS_ORIGIN: true,

	AUTH_LOGIN_URL: 'http://localhost:6453/oauth2/login',
	AUTH_LOGOUT_URL: 'http://localhost:6453/oauth2/logout',
	AUTH_AUTHENTICATE_URL: 'http://localhost:6453/authenticate',
	AUTH_LOGIN_RID: 'auth',
	AUTH_AUTHENTICATE_RID: 'auth',

	HUB_PATH: 'https://mucklet.com/',
};
