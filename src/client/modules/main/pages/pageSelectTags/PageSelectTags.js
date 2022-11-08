import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import PageSelectTagsComponent from './PageSelectTagsComponent';
import './pageSelectTags.scss';

/**
 * PageSelectTags opens an in-panel tag selection page in the character panel.
 */
class PageSelectTags {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'editCharTags',
			'charPages',
			'tags',
			'toaster',
			'api',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.editCharTags.addTool({
			id: 'pageSelectTags',
			sortOrder: 10,
			componentFactory: (ctrl, room) => new Elem(n => n.elem('button', { className: 'iconbtn tiny', events: {
				click: (c, e) => {
					this.open(ctrl, room);
					e.stopPropagation();
				},
			}}, [
				n.component(new FAIcon('list-ul')),
			])),
		});
	}

	/**
	 * Opens an in-panel select tags page in the char panel.
	 * @param {*} ctrl Controlled char model.
	 * @returns {function} Close function.
	 */
	open(ctrl) {
		return this.module.charPages.openPage(
			ctrl.id,
			ctrl.id,
			(ctrl, char, state, close) => ({
				component: new PageSelectTagsComponent(this.module, ctrl, state, close),
				title: l10n.l('pageSelectTags.characterTags', "Character Tags"),
				onClose: close,
			}),
		);
	}

	dispose() {
		this.module.editCharTags.removeTool('pageSelectTags');
	}
}

export default PageSelectTags;
