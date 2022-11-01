const config = {
	login: {
		oauth2Url: '/auth/oauth2/login',
		oauth2LogoutUrl: '/auth/oauth2/logout',
		authenticateUrl: '/auth/authenticate',
		// authenticateUrl: 'https://auth.mucklet.com/authenticate?noredirect',
		loginUrl: 'https://auth.mucklet.com/login?noredirect',
		logoutUrl: 'https://auth.mucklet.com/logout?noredirect',
		registerUrl: 'https://auth.mucklet.com/register?noredirect',
		agreeUrl: 'https://auth.mucklet.com/agree?noredirect',
		googleUrl: 'https://auth.mucklet.com/google',
		crossOrigin: true
	},
	api: {
		hostUrl: 'wss://api.wolfery.com/',
		webResourcePath: 'https://api.wolfery.com/api/'
	},
	avatar: {
		avatarPattern: "https://file.wolfery.com/core/char/avatar/{0}",
		charImgPattern: "https://file.wolfery.com/core/char/img/{0}"
	}
};

export default config;
