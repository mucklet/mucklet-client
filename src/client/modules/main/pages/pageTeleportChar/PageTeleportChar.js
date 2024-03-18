import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import PageTeleportCharComponent from './PageTeleportCharComponent';
import './pageTeleportChar.scss';

/**
 * PageTeleportChar opens an in-panel teleport char page in the char panel.
 */
class PageTeleportChar {
	constructor(app, params) {
		this.app = app;
		this.app.require([ 'charPages', 'pageChar', 'globalTeleports', 'player', 'pageEditTeleport' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.pageChar.addTool({
			id: 'teleport',
			sortOrder: 40,
			componentFactory: (ctrl, char) => new Elem(n => n.elem('button', { className: 'iconbtn small', events: {
				click: () => this.open(ctrl),
			}}, [
				n.component(new FAIcon('arrows')),
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
				component: new PageTeleportCharComponent(this.module, ctrl, state, close),
				onClose: close,
				title: l10n.l('pageTeleportChar.teleportChar', "Teleport Character"),
			}),
		);
	}

	dispose() {
		this.module.pageChar.removeTool('teleport');
	}
}

export default PageTeleportChar;
