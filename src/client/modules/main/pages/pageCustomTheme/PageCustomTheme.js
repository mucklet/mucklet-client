import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PageCustomThemeComponent from './PageCustomThemeComponent';
import PageCustomThemeSettings from './PageCustomThemeSettings';
import './pageCustomTheme.scss';

const storagePrefix = 'pageCustomTheme.';

/**
 * PageCustomTheme adds a Custom theme sections to player settings.
 */
class PageCustomTheme {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onChange = this._onChange.bind(this);

		this.app.require([
			'auth',
			'playerTabs',
			'pagePlayerSettings',
			'theme',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.theme = new Model({ data: {}, eventBus: this.app.eventBus });
		this._listenTheme(true);

		// Add section to player settings.
		if (localStorage) {
			this.module.pagePlayerSettings.addTool({
				id: 'customTheme',
				type: 'section',
				sortOrder: 20,
				componentFactory: (user, player, state) => new PageCustomThemeSettings(this.module, user, player, state),
			});

			this._loadCustomTheme();
		}

		this.closer = null;
	}

	getTheme() {
		return this.theme;
	}

	/**
	 * Opens an in-panel player settings page in the player panel.
	 * @returns {function} Close function.
	 */
	open() {
		if (this.closer) {
			this.closer();
		}
		this.closer = this.module.playerTabs.openPage(
			'customTheme',
			(state, close, layoutId) => ({
				component: new PageCustomThemeComponent(this.module, this.theme, state, close),
				title: l10n.l('pageCustomTheme.customTheme', "Custom theme"),
			}),
			{
				onClose: () => this.closer = null,
			},
		);

		return this.closer;
	}

	_listenTheme(on) {
		this.theme[on ? 'on' : 'off']('change', this._onChange);
	}

	_key() {
		return this.module.auth.getUserPromise().then(user => storagePrefix + user.id + '.theme');
	}

	_saveCustomTheme() {
		if (!localStorage) return;

		this._key().then(key => {
			let props = this.theme.props;
			if (Object.keys(props).length) {
				localStorage.setItem(key, JSON.stringify(props));
			} else {
				localStorage.removeItem(key);
			}
		});
	}

	_loadCustomTheme() {
		this._key().then(key => {
			let raw = localStorage.getItem(key);
			let theme = raw ? JSON.parse(raw) : {};
			this.theme.set(theme);
		});
	}

	_onChange() {
		this.module.theme.setTheme(this.theme.props);
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('customTheme');
		this._listenTheme(false);
	}
}

export default PageCustomTheme;
