import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import copyToClipboard from 'utils/copyToClipboard';

/**
 * MenuItemCopyId adds the char log menu item to copy character ID.
 */
class MenuItemCopyId {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'charLog',
			'toaster',
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
		let c = ev.char;
		if (!c) return;
		copyToClipboard("#" + c.id);
		this.module.toaster.open({
			title: l10n.l('menuItemCopyId.copiedToClipboard', "Copied to clipboard"),
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('menuItemCopyId.copiedIdOfCharacter', "Copied ID of character:"), { tagName: 'p' })),
				n.component(new Txt(c.name + " " + c.surname, { tagName: 'p', className: 'dialog--strong' })),
			])),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		});
	}

	dispose() {
		this.module.charLog.removeMenuItem('copyId');
	}
}

export default MenuItemCopyId;
