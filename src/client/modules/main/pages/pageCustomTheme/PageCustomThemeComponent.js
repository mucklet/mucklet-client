import { Context, Elem } from 'modapp-base-component';
import { ModelComponent, CollectionList } from 'modapp-resource-component';
import { Model, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
import NestedCollection from 'classes/NestedCollection';
import compareSortOrder from 'utils/compareSortOrder';
import PageCustomThemeColor from './PageCustomThemeColor';

const txtOther = l10n.l('pageCustomTheme.other', "Other tokens");

function getGroup(keyPrefix, groups) {
	for (let g of groups) {
		if (keyPrefix == g.keyPrefix) {
			return g;
		}
	}
	return null;
}

class PageCustomThemeComponent {
	constructor(module, theme, state, close) {
		this.module = module;
		this.theme = theme;
		this.state = state;
		this.close = close;
	}

	render(el) {

		this.elem = new Context(
			() => ({
				model: new Model({ data: Object.assign({ selected: null, preview: true }, this.state?.model) }),
				groups: new NestedCollection(new Model({ data: {
					groups: this.module.theme.getGroups(),
					values: this.module.theme.getTokenValues(),
				}}), (m, self) => this._getGroups(m.groups, m.values, self), {
					maxDepth: 3,
				}),
			}),
			(ctx) => {
				this.state = {
					model: ctx.model.props,
				};
				ctx.groups.dispose();
			},
			(ctx) => new ModelComponent(
				ctx.model,
				new ModelComponent(
					this.theme,
					new Elem(n => n.elem('div', { className: 'pagecustomtheme' }, [
						n.component(new CollectionList(
							ctx.groups,
							group => new PanelSection(
								group.name,
								new CollectionList(
									group.tokens,
									token => new ModelComponent(
										token,
										new PageCustomThemeColor(
											ctx.model,
											this.theme,
											token,
											(v, c) => this.theme?.set({ [token.key]: v || undefined }),
										),
										(m, c) => {},
									),
									{ className: 'pagecustomtheme--group' },
								),
								{
									className: 'common--sectionpadding',
									noToggle: true,
								},
							),
							{ className: 'pagecustomtheme--tokens' },
						)),
					])),
					// If preview is on, update theme based on the current settings.
					(m, c) => ctx.model.preview && this.module.theme.setTheme(Object.assign({}, m.props)),
				),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('preview')) {
						this.module.theme.setTheme(Object.assign({}, m.preview ? this.theme.props : this.theme.getModel().props));
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
			this.module.theme.setTheme(this.theme.getModel().props);
		}
	}

	/**
	 * Gets the token groups and values from the theme module, and sorts the
	 * groups and adds tokens under each group, using the longest matching
	 * keyPrefix.
	 *
	 * Groups without tokens are filtered out.
	 * @param {Model<Record<string, {
	 * 	keyPrefix: string,
	 * 	name: LocaleString|string>,
	 * 	sortOrder?: number,
	 * }>>} groups Theme groups model.
	 * @param {Model<Record<string, Model<{
	 *  key: string,
	 * 	value: string|null,
	 * 	theme: string|null,
	 * 	realm: string|null,
	 * 	custom: string|null,
	 * 	param: string|null,
	 * }>>} values Theme values model.
	 * @param {NestedCollection} nestedCollection Collection
	 * @returns {Collection<{
	 * 	keyPrefix: string,
	 * 	name: LocaleString|string,
	 * 	sortOrder?:number,
	 * 	tokens: Collection<Model<{
	 *  	key: string,
	 * 		value: string|null,
	 * 		theme: string|null,
	 * 		realm: string|null,
	 * 		custom: string|null,
	 * 		param: string|null,
	 * }>}>} Group array.
	 */
	_getGroups(groups, values, nestedCollection) {
		let groupMap = {
			'': getGroup('', nestedCollection) || { keyPrefix: '', name: txtOther, sortOrder: Number.MAX_SAFE_INTEGER, tokens: new CollectionWrapper(null) },
		};
		let groupValues = { '': [] };
		// Clone group objects
		for (let k in groups.props) {
			groupMap[k] = getGroup(k, nestedCollection) || Object.assign({}, groups.props[k], { tokens: new CollectionWrapper(null) });
			groupValues[k] = [];
		}

		for (let k in values.props) {
			let parts = k.split('.');
			for (let i = parts.length - 1; i >= 0; i--) {
				let prefix = parts.slice(0, i).join('.');
				let group = groupMap[prefix];
				if (group) {
					groupValues[prefix].push(values.props[k]);
					break;
				}
			}
		}

		return Object.keys(groupMap)
			.filter(k => groupValues[k].length)
			.map(k => {
				let g = groupMap[k];
				g.tokens.setCollection(groupValues[k]);
				return g;
			})
			.sort((a, b) => compareSortOrder(a, b) || a.keyPrefix.localeCompare(b.keyPrefix));
	}

	_save(theme) {
		let mods = theme.getModifications();
		if (!mods) {
			return;
		}
		this.theme.getModel().set(mods);
		theme.reset();
	}
}

export default PageCustomThemeComponent;
