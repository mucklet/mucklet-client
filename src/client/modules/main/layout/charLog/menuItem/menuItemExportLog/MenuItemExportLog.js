import l10n from 'modapp-l10n';

/**
 * MenuItemExportLog adds the char log menu item to export log
 */
class MenuItemExportLog {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'charLog', 'player', 'dialogExportLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.charLog.addMenuItem({
			id: 'exportLog',
			name: l10n.l('menuItemExport.export', "Export"),
			icon: 'file-text-o',
			onClick: this._onClick.bind(this),
			sortOrder: 20,
		});
	}

	_onClick(charId, ev) {
		this.module.dialogExportLog.open(this.module.player.getControlledChar(charId), ev.time);
	}

	dispose() {
		this.module.charLog.removeMenuItem('exportLog');
	}
}

export default MenuItemExportLog;
