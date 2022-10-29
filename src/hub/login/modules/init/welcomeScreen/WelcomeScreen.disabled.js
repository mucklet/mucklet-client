import WelcomeScreenComponent from './WelcomeScreenComponent';
import './welcomeScreen.scss';

/**
 * WelcomeScreen shows a welcome screen.
 */
class WelcomeScreen {

	constructor(app, params) {
		this.app = app;

		this.app.require([], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.app.setComponent(new WelcomeScreenComponent(this.module));
	}
}

export default WelcomeScreen;
