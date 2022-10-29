const config = {
	login: {
		authenticateUrl: '/dockerauth/authenticate?noredirect',
		loginUrl: '/dockerauth/login?noredirect',
		logoutUrl: '/dockerauth/logout?noredirect',
		registerUrl: '/dockerauth/register?noredirect',
		agreeUrl: '/dockerauth/agree?noredirect',
		googleUrl: '/dockerauth/google'
	},
	api: {
		hostUrl: 'ws://api.mucklet.localhost/',
		webResourcePath: 'http://api.mucklet.localhost/api/'
	}
};

export default config;
