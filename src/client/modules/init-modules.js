import Api from 'modules/api/Api';
import Screen from 'modules/screen/Screen';
import Policies from 'modules/policies/Policies';

const modules = {
	api: Api,
	screen: Screen,
	policies: Policies,
};

const req = require.context("./init/", true, /^.*\/([^/]*)\/\1.js$/i);

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
