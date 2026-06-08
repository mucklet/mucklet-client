import Api from 'modules/api/Api';
import Auth from 'modules/auth/Auth';
import Screen from 'modules/screen/Screen';
import Policies from 'modules/policies/Policies';
import ServiceWorker from 'modules/serviceWorker/ServiceWorker';
import Theme from 'modules/theme/Theme';

const modules = {
	api: Api,
	auth: Auth,
	screen: Screen,
	theme: Theme,
	policies: Policies,
	serviceWorker: ServiceWorker,
};

const req = require.context("./init/", true, /^\..*\/([^/]*)\/\1.js$/i);

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
