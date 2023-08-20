import { AppExt } from 'modapp';
import initModules from 'modules/init-modules';
import moduleConfig from 'moduleConfig';
import 'scss/index.scss';

// Create app and load core modules
let app = new AppExt(moduleConfig);
app.loadBundle(initModules).then(result => {
	console.log("Init modules: ", result);
	app.render(document.body);
});

// Make app global
window.app = app;
