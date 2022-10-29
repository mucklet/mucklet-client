import CharSettingsTriggersComponent from './CharSettingsTriggersComponent';
import './charSettingsTriggers.scss';

/**
 * CharSettingsTriggers adds a tool to PageCharSettings to set Do not disturb.
 */
class CharSettingsTriggers {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'player',
			'pageCharSettings',
			'pagePuppeteerSettings',
			'toaster',
			'confirm',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageCharSettings.addTool({
			id: 'triggers',
			type: 'sections',
			sortOrder: 20,
			componentFactory: (char, charSettings, state) => new CharSettingsTriggersComponent(this.module, char, null, charSettings, state),
		});
		this.module.pagePuppeteerSettings.addTool({
			id: 'triggers',
			type: 'sections',
			sortOrder: 20,
			componentFactory: (puppeteer, charSettings, state) => new CharSettingsTriggersComponent(this.module, puppeteer.puppet, puppeteer.char, charSettings, state),
		});
	}

	dispose() {
		this._listen(false);
		this.module.pageCharSettings.removeTool('triggers');
		this.module.pagePuppeteerSettings.removeTool('triggers');
	}
}

export default CharSettingsTriggers;
