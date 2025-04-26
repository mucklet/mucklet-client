import { AppExt } from 'modapp';
import mainModules from './modules/main-modules';
import moduleConfig from 'moduleConfig';
import 'scss/index.scss';

// Create app and load core modules
let app = new AppExt(moduleConfig, { props: window.appProps });
app.loadBundle(mainModules).then(result => {
	console.log("Main modules: ", result);
	app.render(document.body);
});

// Make app global
window.app = app;
