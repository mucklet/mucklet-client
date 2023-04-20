import Viewport from 'modules/viewport/Viewport';
import PlayerTools from 'modules/playerTools/PlayerTools';

const modules = {
	viewport: Viewport,
	playerTools: PlayerTools,
};

const req = require.context("./main/", true, /^\..*\/([^/]*)\/\1.js$/i);

// Using the first-character-lowercase name of the js-file as module name
req.keys().forEach(key => {
	let match = key.match(/\/([^/]*)\.js$/);
	let name = match[1].charAt(0).toLowerCase() + match[1].slice(1);
	if (modules[name]) {
		throw new Error(`duplicate module: ${key}`);
	}
	modules[name] = req(key).default;
});

export default modules;
