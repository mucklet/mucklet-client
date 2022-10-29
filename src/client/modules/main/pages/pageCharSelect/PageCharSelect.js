import { Elem } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import PageCharSelectComponent from './PageCharSelectComponent';
import './pageCharSelect.scss';

/**
 * PageCharSelect draws player panel.
 */
class PageCharSelect {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._openOnNoControl = this._openOnNoControl.bind(this);
		this._onPlayerChange = this._onPlayerChange.bind(this);

		this.app.require([
			'playerTabs',
			'player',
			'dialogCreateChar',
			'confirm',
			'login',
			'pageCharSettings',
			'pagePuppeteerSettings',
			'avatar',
			'dialogRequestControl',
			'screen',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Add charSelect player tab
		this.module.playerTabs.addTab({
			id: 'charSelect',
			sortOrder: 5,
			tabFactory: click => new Elem(n => n.elem('button', { className: 'iconbtn medium light', events: {
				click: (c, e) => {
					click();
					e.stopPropagation();
				}
			}}, [
				n.component(new FAIcon('user-plus')),
			])),
			factory: (state, close, layoutId) => ({
				component: new PageCharSelectComponent(this.module, state, close),
				title: l10n.l('pageCharSelect.characterSelect', "Character Select"),
			}),
		});

		this._setListeners(true);
		this._openOnNoControl();
	}

	/**
	 * Opens an in-panel char select page in the player panel.
	 * @param {bool} reset Flag if the tab should be reset to show the default page. Defaults to false.
	 * @returns {function} Close function.
	 */
	open(reset) {
		return this.module.playerTabs.openTab('charSelect', reset);
	}

	_setListeners(on) {
		let p = this.module.player;
		let cb = on ? 'on' : 'off';
		p[cb]('ctrlRemove', this._openOnNoControl);
		p.getModel()[cb]('change', this._onPlayerChange);
	}

	_onPlayerChange(change) {
		if (change.hasOwnProperty('player')) {
			this._openOnNoControl();
		}
	}

	_openOnNoControl() {
		let ctrls = this.module.player.getControlled();
		if (!ctrls || ctrls.length) return;

		this.open(true);
	}

	dispose() {
		this._setListeners(false);
		this.module.playerTabs.removeTab('charSelect');
	}
}

export default PageCharSelect;
