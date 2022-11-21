const config = {
	login: {
		authenticateUrl: '/dockerauth/authenticate?noredirect',
		loginUrl: '/dockerauth/login?noredirect',
		logoutUrl: '/dockerauth/logout?noredirect',
		registerUrl: '/dockerauth/register?noredirect',
		agreeUrl: '/dockerauth/agree?noredirect',
		googleUrl: '/dockerauth/google',
	},
	api: {
		hostUrl: 'ws://api.mucklet.localhost/',
		webResourcePath: 'http://api.mucklet.localhost/api/',
	},
	avatar: {
		avatarPattern: "http://file.mucklet.localhost/core/char/avatar/{0}",
		charImgPattern: "http://file.mucklet.localhost/core/char/img/{0}",
		roomImgPattern: "http://file.mucklet.localhost/core/room/img/{0}",
	},
};

export default config;
