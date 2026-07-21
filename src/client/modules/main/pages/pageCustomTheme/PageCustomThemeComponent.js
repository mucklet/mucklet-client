import { Elem, Context } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model, ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
import compareSortOrder from 'utils/compareSortOrder';
import PageCustomThemeColor from './PageCustomThemeColor';

const txtOther = l10n.l('pageCustomTheme.other', "Other tokens");

class PageCustomThemeComponent {
	constructor(module, theme, state, close) {
		this.module = module;
		this.theme = theme;
		this.state = state;
		this.close = close;
	}

	render(el) {

		let groups = this._getGroups();
		this.elem = new Context(
			() => ({
				model: new Model({ data: Object.assign({ selected: null, preview: false }, this.state?.model) }),
				theme: new ModifyModel(this.theme, { props: this.state?.theme }),
			}),
			(ctx) => this.state = {
				model: ctx.model.props,
				theme: ctx.theme.getModifications(),
			},
			(ctx) => new ModelComponent(
				ctx.model,
				new ModelComponent(
					ctx.theme,
					new Elem(n => n.elem('div', { className: 'pagecustomtheme' }, groups.map(g => n.component(new PanelSection(
						g.name,
						new Elem(n => n.elem('div', { className: 'pagecustomtheme--group' }, g.tokens.map(t => n.component(new ModelComponent(
							null,
							new PageCustomThemeColor(
								ctx.model,
								ctx.theme,
								t,
								(v, c) => ctx.theme?.set({ [t.key]: v || undefined }),
							),
							(m, c) => {},
						))))),
						{
							noToggle: true,
						},
					))))),
					// If preview is on, update theme based on the current settings.
					(m, c) => ctx.model.preview && this.module.theme.setTheme(m.props),
				),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('preview')) {
						this.module.theme.setTheme(m.preview ? ctx.theme.props : this.theme.props);
					}
				},
			),
		);
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	/**
	 * Gets the token groups and values from the theme module, and sorts the
	 * groups and adds tokens under each group, using the longest matching
	 * keyPrefix.
	 *
	 * Groups without tokens are filtered out.
	 * @returns {Array<{ keyPrefix: string, name: LocaleString|string, sortOrder?:number, tokens: Array<{ key: string, value: string }>}>} Group array.
	 */
	_getGroups() {
		let g = this.module.theme.getGroups();
		let t = this.module.theme.getTokenValues();

		// Clone group objects
		for (let k in g) {
			g[k] = Object.assign({}, g[k], { tokens: [] });
		}
		g[''] = { keyPrefix: '', name: txtOther, sortOrder: Number.MAX_SAFE_INTEGER, tokens: [] };

		for (let k in t) {
			let parts = k.split('.');
			for (let i = parts.length - 1; i >= 0; i--) {
				let prefix = parts.slice(0, i).join('.');
				let group = g[prefix];
				if (group) {
					group.tokens.push({ key: k, value: t[k] });
					break;
				}
			}
		}

		return Object.keys(g)
			.map(k => g[k])
			.filter(o => o.tokens.length)
			.sort((a, b) => compareSortOrder(a, b) || a.keyPrefix.localeCompare(b.keyPrefix));
	}
}

export default PageCustomThemeComponent;
