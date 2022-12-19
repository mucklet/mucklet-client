// Configuration for the site

module.exports = {
	APP_VERSION: '0', // Overwritten by version in package.json
	APP_TITLE: "Wolfery",
	APP_DESCRIPTION: "A textual world of role play. Create a character, wake them up, and join in.",

	API_HOST_PATH: 'wss://api.wolfery.com/',
	API_WEBRESOURCE_PATH: 'https://api.wolfery.com/api/',
	API_FILE_PATH: 'https://file.wolfery.com/',
	API_AUTH_PATH: '/auth/',
	API_IDENTITY_PATH: 'https://auth.mucklet.com/',
	API_CROSS_ORIGIN: true,
	API_OAUTH2: true,

	HUB_PATH: 'https://mucklet.com/',
};
