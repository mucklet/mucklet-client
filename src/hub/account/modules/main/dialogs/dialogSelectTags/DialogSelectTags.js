import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import DialogSelectTagsComponent from './DialogSelectTagsComponent';
import './dialogSelectTags.scss';

/**
 * DialogSelectTags opens an in-panel tag selection page in the character panel.
 */
class DialogSelectTags {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'editRealmTags',
			'toaster',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.editRealmTags.addTool({
			id: 'dialogSelectTags',
			sortOrder: 10,
			componentFactory: (realm) => new Elem(n => n.elem('button', { className: 'iconbtn tiny', events: {
				click: (c, e) => {
					this.open(realm.id);
					e.stopPropagation();
				},
			}}, [
				n.component(new FAIcon('list-ul')),
			])),
		});
	}

	/**
	 * Opens a dialog to select tags for a realm.
	 * @param {string} realmId ID of realm.
	 * @returns {Promise<Dialog>} Promise to the opened dialog object.
	 */
	async open(realmId) {
		if (!this.dialog) {
			this.dialog = true;
			const [ realm, tags ] = await Promise.all([
				this.module.api.get(`control.realm.${realmId}.details`),
				this.module.api.get(`control.tags`),
			]);

			this.dialog = new Dialog({
				title: l10n.l('dialogProductContent.selectRealmTags', "Select realm tags"),
				className: 'dialogproductcontent',
				content: new DialogSelectTagsComponent(this.module, realm, tags, () => this.dialog?.close()),
				onClose: () => { this.dialog = null; },
			});
			this.dialog.open();
		}

		return this.dialog;
	}

	dispose() {
		this.module.editRealmTags.removeTool('dialogSelectTags');
	}
}

export default DialogSelectTags;
