import CharSettingsHelperComponent from './CharSettingsHelperComponent';

/**
 * CharSettingsHelper adds a tool to PageCharSettings to set Helper flag.
 */
class CharSettingsHelper {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'player',
			'pageCharSettings',
			'pagePuppeteerSettings',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageCharSettings.addTool({
			id: 'helper',
			type: 'sections',
			sortOrder: 100,
			componentFactory: (char, charSettings, state) => new CharSettingsHelperComponent(this.module, char, null, charSettings, state),
		});
		this.module.pagePuppeteerSettings.addTool({
			id: 'helper',
			type: 'sections',
			sortOrder: 100,
			componentFactory: (puppeteer, charSettings, state) => new CharSettingsHelperComponent(this.module, puppeteer.puppet, puppeteer.char, charSettings, state),
		});
	}

	dispose() {
		this._listen(false);
		this.module.pageCharSettings.removeTool('helper');
		this.module.pagePuppeteerSettings.removeTool('helper');
	}
}

export default CharSettingsHelper;
