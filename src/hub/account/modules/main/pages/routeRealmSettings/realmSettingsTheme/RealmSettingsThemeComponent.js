import { Elem, Txt, Context } from 'modapp-base-component';
import { CollectionList, ModelComponent } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
import FileButton from 'components/FileButton';
import ModelCollapser from 'components/ModelCollapser';

const themeTokens = [
	{
		key: 'color.base',
		name: l10n.l('realmSettingsTheme.base', "Base"),
		info: l10n.l('realmSettingsTheme.baseInfo', "Base color used for panels and background."),
	},
	{
		key: 'color.accent',
		name: l10n.l('realmSettingsTheme.accent', "Accent"),
		info: l10n.l('realmSettingsTheme.accentInfo', "Accent color used for highlights, titles, and important text."),
	},
	{
		key: 'color.contrast',
		name: l10n.l('realmSettingsTheme.contrast', "Contrast"),
		info: l10n.l('realmSettingsTheme.contrastInfo', "High contrast color used for active states and emphasized text."),
	},
	{
		key: 'color.neutral',
		name: l10n.l('realmSettingsTheme.neutral', "Neutral"),
		info: l10n.l('realmSettingsTheme.neutralInfo', "Neutral color used for regular text and less prominent details."),
	},
	{
		key: 'color.danger',
		name: l10n.l('realmSettingsTheme.danger', "Danger"),
		info: l10n.l('realmSettingsTheme.dangerInfo', "Danger color used for warnings, errors, and destructive actions."),
	},
	{
		key: 'color.action',
		name: l10n.l('realmSettingsTheme.action', "Action"),
		info: l10n.l('realmSettingsTheme.actionInfo', "Action color used for links, buttons, and interactive elements."),
	},
	{
		key: 'color.success',
		name: l10n.l('realmSettingsTheme.success', "Success"),
		info: l10n.l('realmSettingsTheme.successInfo', "Success color used for completed states and positive status."),
	},
];

const txtInvalidThemeFile = l10n.l('realmSettingsTheme.invalidThemeFile', "Invalid theme file");

function clearModelObject(model) {
	let o = {};
	let mods = model.getModifications() || {};
	for (let key in model.getModel().props) {
		if (key != '_hash') {
			o[key] = undefined;
		}
	}
	for (let key in mods) {
		o[key] = undefined;
	}
	return o;
}

class RealmSettingsThemeComponent {
	constructor(module, realm, state) {
		this.module = module;
		this.realm = realm;
		this.theme = realm.theme;
		this.state = state;
		this.themeState = state.realmSettingsTheme || {};
		state.realmSettingsTheme = this.themeState;
	}

	render(el) {
		this.elem = new Context(
			() => new ModifyModel(this.theme, {
				props: this.themeState,
				modifiedOnNew: true,
			}),
			model => model.dispose(),
			model => new PanelSection(
				new Elem(n => n.elem('div', { className: 'realmsettingstheme--title flex-row gap8' }, [
					n.component(new Txt(l10n.l('realmSettingsTheme.colorTheme', "Color theme"), { tagName: 'h3', className: 'flex-1' })),

					n.component(new Context(
						() => new CollectionWrapper(this.module.self.getTools(), {
							filter: t => (!t.type || t.type == 'title') && (t.filter ? t.filter(this.realm) : true),
						}),
						tools => tools.dispose(),
						tools => new CollectionList(
							tools,
							t => t.componentFactory(this.realm, this.themeState),
							{
								className: 'realmsettingstheme--tools',
								subClassName: t => t.className || null,
								horizontal: true,
							},
						),
					)),
				])),
				new Elem(n => n.elem('div', [
					// Token list
					n.elem('div', { className: 'common--sectionpadding' }, [
						n.component(new CollectionList(
							themeTokens,
							t => this._newToken(t, model),
							{
								className: 'realmsettingstheme--tokens',
							},
						)),
					]),
					// Unsaved changed
					n.component(new ModelCollapser(model, [{
						condition: m => m.isModified,
						factory: m => new Elem(n => n.elem('div', {
							className: 'link realmsettingstheme--unsaved',
							attributes: {
								target: '_blank',
							},
							events: {
								click: (c, ev) => ev.stopPropagation(),
							},
						}, [
							n.component(new FAIcon('exclamation-circle')),
							n.html('&nbsp;&nbsp;'),
							n.component(new Txt(l10n.l('realmSettingsTheme.themeIsModified', "Theme contains unsaved changes"))),
						])),
					}])),

					n.elem('div', { className: 'flex-row gap16 pad-top-l' }, [

						// Import theme
						n.component(new FileButton(
							new Elem(n => n.elem('div', [
								n.component(new FAIcon('upload')),
								n.component(new Txt(l10n.l('realmSettingsTheme.importTheme', "Import theme"))),
							])),
							(file, text) => this._import(model, text),
							{
								className: 'btn small icon-left flex-auto',
								asText: true,
								onError: () => this.module.toaster.openError(l10n.l('realmSettingsTheme.importFailed', "Failed to import theme file")),
							},
						)),

						// Reset theme
						n.elem('div', { className: 'flex-auto' }, [
							n.component(new ModelComponent(
								model,
								new Elem(n => n.elem('button', { className: 'btn small icon-left warning', events: {
									click: (el, e) => {
										this._reset(model);
										e.stopPropagation();
									},
								}}, [
									n.component(new FAIcon('undo')),
									n.component(new Txt(l10n.l('realmSettingsTheme.resetTheme', "Reset theme"))),
								])),
								(m, c) => {
									let count = Object.keys(model.props).filter(k => k != '_hash' && k != 'isModified').length;
									c.setProperty('disabled', count ? null : 'disabled');
								},
							)),
						]),
					]),

				])),
				{
					className: 'realmsettingstheme common--sectionpadding',
					noToggle: true,
				},
			),
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_newToken(token, model) {
		return new ModelComponent(
			model,
			new Elem(n => n.elem('div', { className: 'realmsettingstheme--token' }, [
				n.elem('color', 'div', { className: 'realmsettingstheme--tokencolor' }),
				n.elem('div', { className: 'realmsettingstheme--tokeninfo' }, [
					n.component(new Txt(token.name, { tagName: 'div', className: 'realmsettingstheme--tokenname' })),
					n.component(new Txt(token.info, { tagName: 'div', className: 'realmsettingstheme--tokendesc' })),
				]),
			])),
			(m, c, change) => {
				if (change && !change.hasOwnProperty(token.key)) {
					return;
				}
				c.setNodeStyle('color', 'backgroundColor', m.props[token.key] || APP_COLORS[token.key.split('.')[1]]);
			},
		);
	}

	_setModel(model, token, value) {
		model.set({ [token.key]: value });
		this._updateModel(model);
	}

	_import(model, text) {
		let imported;
		try {
			imported = JSON.parse(text);
		} catch (err) {
			this.module.toaster.openError(txtInvalidThemeFile);
			return;
		}
		if (!imported || typeof imported != 'object' || Array.isArray(imported)) {
			this.module.toaster.openError(txtInvalidThemeFile);
			return;
		}

		let changes = {};
		let modifications = model.getModifications() || {};
		for (let key in model.getModel().props) {
			if (key != '_hash') {
				changes[key] = undefined;
			}
		}
		for (let key in modifications) {
			changes[key] = undefined;
		}

		model.set(Object.assign(clearModelObject(model), imported));
		this._updateModel(model);
	}

	_reset(model) {
		model.set(clearModelObject(model));
		this._updateModel(model);
	}

	_updateModel(model) {
		this.themeState = model.getModifications() || {};
		this.state.realmSettingsTheme = this.themeState;
		// Set realm with our model if it has been modified,
		// to make it signal that there is updated properties.
		this.realm.set({ theme: model.isModified ? model : this.theme });
	}
}

export default RealmSettingsThemeComponent;
