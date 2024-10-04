import l10n from 'modapp-l10n';

/**
 * MenuItemReport adds the char log menu item to report abuse
 */
class MenuItemReport {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'charLog', 'dialogReport' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.charLog.addMenuItem({
			id: 'report',
			name: l10n.l('menuItemReport.report', "Report"),
			icon: 'flag',
			onClick: this._onClick.bind(this),
			filter: (charId, ev) => ev.char && ev.char.id != charId,
			sortOrder: 500,
		});
	}

	_onClick(charId, ev) {
		this.module.dialogReport.open(charId, ev.char.id, ev.puppeteer && ev.puppeteer.id, {
			attachEvent: ev,
		});
	}

	dispose() {
		this.module.charLog.removeMenuItem('report');
	}
}

export default MenuItemReport;
