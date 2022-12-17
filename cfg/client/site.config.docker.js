// Configuration for the site

module.exports = {
	APP_VERSION: '0', // Overwritten by version in package.json
	APP_TITLE: "Docker Wolfery",
	APP_DESCRIPTION: "A textual world of role play. Create a character, wake them up, and join in.",

	API_HOST_PATH: 'ws://api.mucklet.localhost/',
	API_WEBRESOURCE_PATH: 'http://api.mucklet.localhost/api/',
	API_FILE_PATH: 'http://file.mucklet.localhost/',
	API_AUTH_PATH: '/auth/',
	API_IDENTITY_PATH: '/dockerauth/',
	API_CROSS_ORIGIN: false,
	API_OAUTH2: false,

	HUB_PATH: 'http://mucklet.localhost/',
};
