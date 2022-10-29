const config = {
	login: {
		authenticateUrl: null,
		crossOrigin: true
	},
	api: {
		hostUrl: 'wss://api.test.mucklet.com/',
		webResourcePath: 'https://api.test.mucklet.com/api/'
	},
	avatar: {
		avatarPattern: "https://file.test.mucklet.com/core/char/avatar/{0}",
		charImgPattern: "https://file.test.mucklet.com/core/char/img/{0}"
	},
	confirmClose: { active: false },
};

export default config;
