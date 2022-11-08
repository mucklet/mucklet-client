const config = {
	login: {
		realm: 'wolfery',
		authenticateUrl: 'https://auth.mucklet.com/authenticate?noredirect',
		loginUrl: 'https://auth.mucklet.com/login?noredirect',
		logoutUrl: 'https://auth.mucklet.com/logout?noredirect',
		registerUrl: 'https://auth.mucklet.com/register?noredirect',
		agreeUrl: 'https://auth.mucklet.com/agree?noredirect',
		googleUrl: 'https://auth.mucklet.com/google',
		redirectUrl: 'https://auth.mucklet.com/oauth2/authenticate',
		recoverUrl: 'https://auth.mucklet.com/recover?noredirect',
		crossOrigin: true,
	},
	loginVerify: {
		authenticateUrl: 'https://auth.mucklet.com/authenticate?noredirect',
		loginUrl: 'https://auth.mucklet.com/login?noredirect',
		verifyUrl: 'https://auth.mucklet.com/verify?noredirect',
		redirectUrl: '/',
		crossOrigin: true,
	},
	passwordReset: {
		resetUrl: 'https://auth.mucklet.com/resetpass?noredirect',
		resetValidateUrl: 'https://auth.mucklet.com/resetpass/validate?noredirect',
		redirectUrl: '/',
		crossOrigin: true,
	},
};

export default config;
