import { Elem } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import DialogCharSnapshotAttachmentSnapshot from './DialogCharSnapshotAttachmentSnapshot';
import './dialogCharSnapshotAttachment.scss';

class DialogCharSnapshotAttachment {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'charLog',
			'confirm',
			'avatar',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	/**
	 * Open dialog to show a charSnapshot attachment
	 * @param {CharSnapshotInfo} info CharSnapshot info model with a snapshotId property.
	 * @param {Model} reporter Reporter object.
	 */
	open(info, reporter) {
		if (this.dialog) return;

		this.dialog = true;

		this.module.api.get('report.charsnapshot.' + info.snapshotId)
			.then(snapshot => {
				this.dialog = new Dialog({
					title: l10n.l('dialogCharSnapshotAttachment.characterSnapshot', "Character snapshot"),
					className: 'dialogcharsnapshotattachment',
					content: new Elem(n => n.elem('div', [
						n.component(new DialogCharSnapshotAttachmentSnapshot(this.module, snapshot, {})),
					])),
					onClose: () => this.dialog = null,
				});

				this.dialog.open();
			})
			.catch(err => {
				this.dialog = null;
				this.module.confirm.openError(err);
			});
	}
}

export default DialogCharSnapshotAttachment;
