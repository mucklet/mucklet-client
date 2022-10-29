import { Context } from 'modapp-base-component';
import { CollectionComponent, ModelTxt, CollectionList } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import PageSelectTagsTag from './PageSelectTagsTag';


class PageSelectTagsSection {
	constructor(module, collection, group, model, custom, opt) {
		opt = opt || {};
		this.module = module;
		this.collection = collection;
		this.group = group;
		this.model = model;
		this.custom = custom;
		this.tags = this.module.tags.getTags();
		this.groups = this.module.tags.getGroups();
		this.className = opt.className ? ' ' + opt.className : '';
		this.isRoleTags = !!opt.isRoleTags;

		this._onCustomChange = this._onCustomChange.bind(this);
	}

	render(el) {
		this._listenCustom(true);
		this.elem = new Context(
			() => new CollectionWrapper(this.collection, {
				filter: t => this._inGroup(t)
					&& !this._hasCustom(t)
					&& this.isRoleTags !== !(t.role || t.idRole)
			}),
			tags => tags.dispose(),
			tags => new CollectionComponent(
				tags,
				new Collapser(),
				(col, c, ev) => {
					// Collapse if we have no tools to show
					if (!col.length) {
						c.setComponent(null);
						return;
					}

					if (!ev || (col.length == 1 && ev.event == 'add')) {
						c.setComponent(new PanelSection(
							new ModelTxt(this.group, m => m.name, { className: 'pageselecttags-section--title', tagName: 'h3' }),
							new CollectionList(col, tag => new PageSelectTagsTag(this.model, tag, this.module.tags.getPreferences())),
							{
								className: 'pageselecttags-section pad-bottom-s' + this.className
							}
						));
					}
				}
			)
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this._listenCustom(false);
			this.elem.unrender();
			this.elem = null;
		}
	}

	_listenCustom(on) {
		if (this.custom) {
			this.custom[on ? 'on' : 'off']('change', this._onCustomChange);
		}
	}

	_onCustomChange(c) {
		if (this.elem) {
			let col = this.elem.getContext();
			if (col) {
				col.refresh();
			}
		}
	}

	_inGroup(tag) {
		let group = tag.group;
		let key = this.group.key;
		return key
			? group == key
			: !group || !this.groups.props[group];
	}

	_hasCustom(tag) {
		return this.custom && this.custom.props[tag.key];
	}
}

export default PageSelectTagsSection;
