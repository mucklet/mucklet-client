import l10n from 'modapp-l10n';

/**
 * MenuItemCopyId adds the char log menu item to copy character ID.
 */
class MenuItemCopyId {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'charLog',
			'copyCharId',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.charLog.addMenuItem({
			id: 'copyId',
			name: l10n.l('menuItemCopyId.report', "Copy ID"),
			icon: 'clipboard',
			onClick: this._copy.bind(this),
			filter: (charId, ev) => ev.char,
			sortOrder: 400,
		});
	}

	_copy(charId, ev) {
		if (ev.char) {
			this.module.copyCharId.copy(ev.char);
		}
	}

	dispose() {
		this.module.charLog.removeMenuItem('copyId');
	}
}

export default MenuItemCopyId;
