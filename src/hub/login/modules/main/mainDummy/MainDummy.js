/**
 * MainDummy is a dummy module.
 */
class MainDummy {
	constructor(app) {
		this.app = app;

		this.app.require([], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		console.log("MainDummy module loaded.");
	}

	dispose() {}
}

export default MainDummy;
