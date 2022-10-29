import { Elem } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import PageWatchComponent from './PageWatchComponent';
import './pageWatch.scss';

/**
 * PageWatch adds the watch for player panel page
 */
class PageWatch {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'playerTabs',
			'player',
			'confirm',
			'avatar',
			'charsAwake',
			'dialogEditNote',
			'dialogAboutChar'
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Add watch player tab
		this.module.playerTabs.addTab({
			id: 'watch',
			sortOrder: 20,
			tabFactory: click => new Elem(n => n.elem('button', { className: 'iconbtn medium light', events: {
				click: (c, e) => {
					click();
					e.stopPropagation();
				}
			}}, [
				n.component(new FAIcon('eye')),
			])),
			factory: (state, close, layoutId) => ({
				component: new PageWatchComponent(this.module, state, close),
				title: l10n.l('pageWatch.watchFor', "Watch For"),
			}),
		});
	}

	/**
	 * Opens an in-panel char select page in the player panel.
	 * @param {bool} reset Flag if the tab should be reset to show the default page. Defaults to false.
	 * @returns {function} Close function.
	 */
	open(reset) {
		return this.module.playerTabs.openTab('watch', reset);
	}


	dispose() {
		this.module.playerTabs.removeTab('watch');
	}
}

export default PageWatch;
