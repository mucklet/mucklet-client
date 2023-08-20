import GreetingScreenComponent from './GreetingScreenComponent';
import './greetingScreen.scss';

/**
 * GreetingScreen shows a greeting screen.
 */
class GreetingScreen {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'screen',
			'auth',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.screen.setComponent(new GreetingScreenComponent(this.module));
	}
}

export default GreetingScreen;
