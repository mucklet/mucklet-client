import { Context, Elem } from 'modapp-base-component';
import { ModelComponent, CollectionList } from 'modapp-resource-component';
import { Model, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
import LabelToggleBox from 'components/LabelToggleBox';
import FAIcon from 'components/FAIcon';
import ModelFader from 'components/ModelFader';
import NestedCollection from 'classes/NestedCollection';
import NestedModel from 'classes/NestedModel';
import compareSortOrder from 'utils/compareSortOrder';
import exportFile from 'utils/exportFile';
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
				values: new NestedModel(this.theme, (m) => this.module.theme.calculateTheme(m.props), {
					maxDepth: 1,
				}),
			}),
			(ctx) => {
				this.state = {
					model: ctx.model.props,
				};
				ctx.groups.dispose();
				ctx.values.dispose();
			},
			(ctx) => new ModelComponent(
				ctx.model,
				new ModelComponent(
					this.theme,
					new Elem(n => n.elem('div', { className: 'pagecustomtheme' }, [

						// Tools
						n.elem('div', { className: 'flex-row' }, [
							// Preview theme toggle box
							n.elem('div', { className: 'flex-1' }, [
								n.component(new LabelToggleBox("Preview theme", ctx.model.preview, {
									onChange: preview => ctx.model.set({ preview }),
								})),
							]),

							// Overseer token export
							n.component(new ModelFader(this.module.player.getModel(), [{
								condition: () => this.module.player.isOverseer(),
								factory: () => new Elem(n => n.elem('button', { className: 'iconbtn tiny default-400 flex-auto', events: {
									click: (el, e) => {
										this._exportTokens();
										e.stopPropagation();
									},
								}}, [
									n.component(new FAIcon('share-square-o')),
								])),
							}])),
						]),

						// Divider for tokens
						n.elem('div', { className: 'common--hr' }),

						// Token groups
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
											ctx.values,
											token.key,
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

	_exportTokens() {
		let tokens = this.module.theme.export();
		let filename = 'client_tokens_' + this.module.info.getClient().version + '.json';
		exportFile(filename, JSON.stringify(tokens, null, 2), 'application/json');
	}
}

export default PageCustomThemeComponent;
