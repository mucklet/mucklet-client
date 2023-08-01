// Configuration for the site

module.exports = {
	APP_VERSION: '0', // Overwritten by version in package.json
	APP_TITLE: "Dev Mucklet",
	APP_DESCRIPTION: "A textual world of role play. Create a character, wake them up, and join in.",

	API_HOST_PATH: 'ws://localhost:8080/',
	API_WEBRESOURCE_PATH: 'http://localhost:8080/api/',
	API_IDENTITY_PATH: '/identity/',
	API_CROSS_ORIGIN: true,
	API_OAUTH2: true,

	HUB_PATH: 'http://localhost:6460/',
};
