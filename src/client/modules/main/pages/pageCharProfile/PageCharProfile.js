import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import PageCharProfileComponent from './PageCharProfileComponent';
import './pageCharProfile.scss';

/**
 * PageCharProfile opens an page in the char panel listing the characters's profiles.
 */
class PageCharProfile {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'charPages',
			'pageChar',
			'dialogCreateCharProfile',
			'avatar',
			'confirm',
			'profile',
			'updateProfile',
			'pageEditCharProfile',
			'createLimits',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.pageChar.addTool({
			id: 'profile',
			sortOrder: 20,
			componentFactory: (ctrl, char) => new Elem(n => n.elem('button', { className: 'iconbtn small', events: {
				click: () => this.open(ctrl),
			}}, [
				n.component(new FAIcon('id-card-o')),
			])),
			filter: (ctrl, char) => ctrl.id == char.id,
		});
	}

	/**
	 * Opens an in-panel teleport char page in the char panel.
	 * @param {*} ctrl Controlled char model.
	 * @returns {function} Close function.
	 */
	open(ctrl) {
		return this.module.charPages.openPage(
			ctrl.id,
			ctrl.id,
			(ctrl, char, state, close) => ({
				component: new PageCharProfileComponent(this.module, ctrl, state, close),
				onClose: close,
				title: l10n.l('pageCharProfile.characterProfiles', "Character Profiles"),
			}),
		);
	}

	dispose() {
		this.module.pageChar.removeTool('profile');
	}
}

export default PageCharProfile;
