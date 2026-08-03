import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model, ModifyModel } from 'modapp-resource';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import exportFile from 'utils/exportFile';
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
			'toaster',
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
		let theme = new ModifyModel(this.theme, {
			props: this.state?.theme,
			modifiedOnNew: true,
		});
		this.closer = this.module.playerTabs.openPage(
			'customTheme',
			(state, close, layoutId) => ({
				component: new PageCustomThemeComponent(this.module, theme, state, close),
				title: l10n.l('pageCustomTheme.customTheme', "Custom theme"),
			}),
			{
				onClose: () => {
					this.closer = null;
					theme.dispose();
				},
				overlayComponent: new Elem(n => n.elem('div', { className: 'pagecustomtheme--footer flex-row gap8' }, [
					n.component(new ModelComponent(
						theme,
						new Elem(n => n.elem('button', { events: {
							click: (c, ev) => {
								ev.stopPropagation();
								let mods = theme.getModifications();
								if (!mods) {
									return;
								}
								theme.getModel().set(mods);
								theme.reset();
							},
						}, className: 'btn primary flex-1 medium' }, [
							n.component(new Txt(l10n.l('pageCustomTheme.update', "Save theme"))),
						])),
						(m, c) => c.setProperty('disabled', m.isModified ? null : 'disabled'),
					)),
					n.elem('button', { className: 'iconbtn medium default-400 flex-auto', events: {
						click: () => this._import(theme),
					}}, [
						n.component(new FAIcon('upload')),
					]),
					n.elem('button', { className: 'iconbtn medium default-400 flex-auto', events: {
						click: () => this._export(theme),
					}}, [
						n.component(new FAIcon('download')),
					]),
				])),
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
		this._saveCustomTheme();
	}

	_import() {

	}

	_export(theme) {
		let overrides = {};
		let modifications = theme.getModifications() || {};
		let values = this.module.theme.getTokenValues().props;
		for (let key in values) {
			let token = values[key];
			let value = token.realm;
			if (token.theme) {
				value = token.theme;
			}
			if (modifications.hasOwnProperty(key)) {
				value = modifications[key] || token.realm;
			}
			if (value) {
				overrides[key] = value;
			}
		}

		let date = new Date();
		let filename = 'theme_' + date.getFullYear() + '-' +
			('0' + (date.getMonth() + 1)).slice(-2) + '-' +
			('0' + date.getDate()).slice(-2) + '_' +
			('0' + date.getHours()).slice(-2) +
			('0' + date.getMinutes()).slice(-2) +
			('0' + date.getSeconds()).slice(-2) + '.json';
		exportFile(filename, JSON.stringify(overrides, null, 2), 'application/json');
	}

	dispose() {
		this.module.pagePlayerSettings.removeTool('customTheme');
		this._listenTheme(false);
	}
}

export default PageCustomTheme;
