import { Elem, Txt, Context, Input } from 'modapp-base-component';
import { CollectionList, ModelComponent } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
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
		key: 'color.muted',
		name: l10n.l('realmSettingsTheme.muted', "Muted"),
		info: l10n.l('realmSettingsTheme.mutedInfo', "Muted color used for regular text and less prominent details."),
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
];

class RealmSettingsThemeComponent {
	constructor(module, realm, state) {
		this.module = module;
		this.realm = realm;
		this.theme = realm.theme;
		this.state = state.realmSettingsTheme || {};
		state.realmSettingsTheme = this.state;
	}

	render(el) {
		this.elem = new Context(
			() => new ModifyModel(this.theme, {
				props: this.state,
				modifiedOnNew: true,
			}),
			model => model.dispose(),
			model => new PanelSection(
				new Elem(n => n.elem('div', { className: 'realmsettingstheme--title' }, [
					n.component(new Txt(l10n.l('realmSettingsTheme.colorTheme', "Color theme"), { tagName: 'h3' })),
					n.component(new Context(
						() => new CollectionWrapper(this.module.self.getTools(), {
							filter: t => (!t.type || t.type == 'title') && (t.filter ? t.filter(this.realm) : true),
						}),
						tools => tools.dispose(),
						tools => new CollectionList(
							tools,
							t => t.componentFactory(this.realm, this.state),
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

					// Try out link
					n.component(new ModelCollapser(model, [{
						condition: m => m.isModified,
						factory: m => {
							let txt = new Elem(n => n.elem('a', {
								className: 'link realmsettingstheme--link',
								attributes: {
									target: '_blank',
								},
								events: {
									click: (c, ev) => ev.stopPropagation(),
								},
							}, [
								n.component(new FAIcon('external-link')),
								n.html('&nbsp;&nbsp;'),
								n.component(new Txt(l10n.l('realmSettingsTheme.tryChanges', "Try theme"))),
							]));
							let update = () => {
								let q = Object.keys(m.props)
									.filter(k => k != '_hash' && k != 'isModified')
									.map(k => `theme.${encodeURIComponent(k)}=${encodeURIComponent(m.props[k])}`)
									.join('&');
								let url = this.realm.clientUrl;
								if (q) {
									url += (url.includes('?') ? '&' : '?') + q;
								}
								txt.setAttribute('href', url);
							};
							return new ModelComponent(
								this.realm,
								new ModelComponent(m, txt, update),
								update,
							);
						},
					}])),

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
				n.elem('div', { className: 'realmsettingstheme--tokeninfo' }, [
					n.component(new Txt(token.name, { tagName: 'div', className: 'realmsettingstheme--tokenname' })),
					n.component(new Txt(token.info, { tagName: 'div', className: 'realmsettingstheme--tokendesc' })),
				]),
				n.elem('color', 'div', { className: 'realmsettingstheme--tokencolor' }),

				n.elem('div', { className: 'realmsettingstheme--tokencont' }, [
					n.component('input', new Input('', {
						className: 'realmsettingstheme--tokeninput',
						attributes: {
							name: 'realmsettingstheme--token-' + token.key.replaceAll('.', '-'),
							placeholder: APP_COLORS[token.key.split('.')[1]],
							maxlength: 7,
							spellcheck: false,
						},
						events: {
							input: (c) => {
								let v = c.getValue();
								let color = this._normalizeHexColor(v);
								c[!v || color ? 'removeClass' : 'addClass']('input--incomplete');

								if (!v) {
									this._setModel(model, token, undefined);
								} else if (color) {
									this._setModel(model, token, color);
									c.setValue(color);
								}
							},
							blur: c => {
								c.setValue(model.props[token.key] || '');
								c.removeClass('input--incomplete');
							},
						},
					})),
					n.elem('reset', 'button', {
						className: 'realmsettingstheme--tokenreset iconbtn medium tinyicon',
						attributes: {
							type: 'button',
						},
						events: {
							click: () => this._setModel(model, token, this.theme.props[token.key]),
						},
					}, [
						n.component(new FAIcon('times')),
					]),
				]),
			])),
			(m, c, change) => {
				// Set disable button
				c.setNodeProperty('reset', 'disabled', model.getModifications()?.hasOwnProperty(token.key) ? null : 'disabled');

				if (change && !change.hasOwnProperty(token.key)) {
					return;
				}
				let color = model.props[token.key];
				let input = c.getNode('input');
				c.setNodeStyle('color', 'backgroundColor', color || APP_COLORS[token.key.split('.')[1]] || '');
				input.setValue(color || '');
				input.removeClass('input--incomplete');
			},
		);
	}

	_setModel(model, token, value) {
		model.set({ [token.key]: value });
		this.state = model.getModifications();
		// Set realm with our model if it has been modified,
		// to make it signal that there is updated properties.
		this.realm.set({ theme: model.isModified ? model : this.theme });
	}

	_normalizeHexColor(color) {
		color = String(color || '').trim();
		let match = color.match(/^#?([0-9a-f]{6})$/i);
		if (!match) {
			return null;
		}
		return '#' + match[1].toLowerCase();
	}
}

export default RealmSettingsThemeComponent;
