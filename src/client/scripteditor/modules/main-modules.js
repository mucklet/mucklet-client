import Api from 'modules/api/Api';
import Auth from 'modules/auth/Auth';
import Screen from 'modules/screen/Screen';
import Boot from 'modules/boot/Boot';
import Router from 'modules/router/Router';
import Confirm from 'modules/confirm/Confirm';
import Toaster from 'modules/toaster/Toaster';

const modules = {
	api: Api,
	auth: Auth,
	screen: Screen,
	boot: Boot,
	router: Router,
	confirm: Confirm,
	toaster: Toaster,
};

const req = require.context("./main/", true, /^\..*\/([^/]*)\/\1.js$/i);

// Using the first-character-lowercase name of the js-file as module name
req.keys().forEach(key => {
	let match = key.match(/\/([^/]*)\.js$/);
	let name = match[1].charAt(0).toLowerCase() + match[1].slice(1);
	if (modules[name]) {
		throw new Error(`Duplicate module: ${key}`);
	}
	modules[name] = req(key).default;
});

export default modules;
