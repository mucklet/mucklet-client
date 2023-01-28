import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import copyToClipboard from 'utils/copyToClipboard';

/**
 * CopyCharId provides a central method for copying character IDs to clipboard.
 */
class CopyCharId {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

	}

	/**
	 * Copies the ID of a character to clipboard, and shows a toaster on
	 * success.
	 * @param {Model} char Character model.
	 */
	copy(char) {
		if (!char) return;
		copyToClipboard("#" + char.id).then(() => this.module.toaster.open({
			title: l10n.l('copyCharId.copiedToClipboard', "Copied to clipboard"),
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('copyCharId.copiedIdOfCharacter', "Copied ID of character:"), { tagName: 'p' })),
				n.component(new Txt(char.name + " " + char.surname, { tagName: 'p', className: 'dialog--strong' })),
			])),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		})).catch(err => this.module.toaster.openError(err, {
			title: l10n.l('copyCharId.failedToCopyToClipboard', "Failed to copy to clipboard"),
		}));
	}

	dispose() {
		this.module.charLog.removeMenuItem('copyId');
	}
}

export default CopyCharId;
