import { AppExt } from 'modapp';
import moduleConfig from 'moduleConfig';
// Modules
import Api from 'modules/api/Api';
import Auth from 'modules/auth/Auth';
import Screen from 'modules/screen/Screen';
import GreetingScreen from 'modules/greetingScreen/GreetingScreen';
import RealmInfo from 'modules/realmInfo/RealmInfo';
import Theme from 'modules/theme/Theme';

import 'scss/index.scss';

const modules = {
	api: Api,
	auth: Auth,
	screen: Screen,
	theme: Theme,
	greetingScreen: GreetingScreen,
	realmInfo: RealmInfo,
};

// Create app and load core modules
let app = new AppExt(moduleConfig, { props: window.appProps });
app.loadBundle(modules).then(result => {
	console.log("Welcome modules: ", result);
	app.render(document.body);
});

// Make app global
window.app = app;
