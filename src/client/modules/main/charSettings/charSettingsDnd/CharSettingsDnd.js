import CharSettingsDndComponent from './CharSettingsDndComponent';

/**
 * CharSettingsDnd adds a tool to PageCharSettings to set Do not disturb.
 */
class CharSettingsDnd {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'player',
			'pageCharSettings',
			'pagePuppeteerSettings',
			'toaster',
			'dialogEditDndMsg',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageCharSettings.addTool({
			id: 'dnd',
			type: 'topSection',
			sortOrder: 10,
			componentFactory: (char, charSettings, state) => new CharSettingsDndComponent(this.module, char, null, charSettings, state),
		});
		this.module.pagePuppeteerSettings.addTool({
			id: 'dnd',
			type: 'topSection',
			sortOrder: 10,
			componentFactory: (puppeteer, charSettings, state) => new CharSettingsDndComponent(this.module, puppeteer.puppet, puppeteer.char, charSettings, state),
		});
	}

	dispose() {
		this._listen(false);
		this.module.pageCharSettings.removeTool('dnd');
		this.module.pagePuppeteerSettings.removeTool('dnd');
	}
}

export default CharSettingsDnd;
