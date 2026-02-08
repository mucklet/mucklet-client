import { Elem, Context } from 'modapp-base-component';
import { CollectionList, ModelTxt, ModelComponent } from 'modapp-resource-component';
import { ModelToCollection } from 'modapp-resource';
import { isResError } from 'resclient';
import FAIcon from './FAIcon';
import * as tooltip from 'utils/tooltip';
import tagTypes from 'utils/tagTypes';
import './realmTagsList.scss';

function staticClone(tags) {
	return { ...(tags?.props || tags) };
}

const typeOrder = {
	genre: 0,
	theme: 1,
	warn: 2,
};

export function hasTags(tags) {
	if (tags) {
		tags = tags.props ? tags.props : tags;
		for (let k in tags) {
			if (!isResError(tags[k])) return true;
		}
	}
	return false;
}

/**
 * RealmTagsList shows a list of realm tags.
 */
class RealmTagsList {

	/**
	 * Creates an instance of RealmTagsList
	 * @param {Model<Record<string,TagModel>>} tags Model of of realm tags.
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.static] Boolean telling if the tags should be static, not changing on updates. Defaults to false.
	 * @param {boolean} [opt.onDelete] Callback called on delete icon click. Defaults to hiding the delete icon. function(tag, tags)
	 * @param {string} [opt.tooltipMargin] Tooltip margin to use. May be 'm'.
	 * @param {EventBus} [opt.eventBus] Event bus.
	 */
	constructor(tags, opt) {
		opt = Object.assign({ horizontal: true }, opt);
		opt.className = 'realmtagslist' + (opt.className ? ' ' + opt.className : '');
		if (opt.static) {
			tags = staticClone(tags);
		}
		this.opt = opt;
		this.tags = tags;
	}


	render(el) {
		let onDelete = this.opt.onDelete;
		this.elem = new Context(
			() => new ModelToCollection(this.tags, {
				filter: (k, v) => !isResError(v),
				compare: (a, b) => {
					let at = a.value;
					let bt = b.value;
					return typeOrder[at.type] - typeOrder[bt.type] ||
						at.key.localeCompare(bt.key) ||
						at.id.localeCompare(bt.id);
				},
				eventBus: this.opt.eventBus,
			}),
			col => col.dispose(),
			col => new Elem(n => n.elem('div', { className: this.opt.className }, [
				n.component(new CollectionList(
					col,
					tag => new ModelComponent(
						tag,
						new Elem(n => n.elem('div', {
							className: 'realmtagslist--tag',
							events: {
								click: (c, ev) => {
									this.tooltip = tooltip.click(ev.currentTarget.parentElement, tag.desc, { margin: this.opt.tooltipMargin });
									ev.stopPropagation();
								},
								mouseenter: (c, ev) => {
									this.tooltip = tooltip.mouseEnter(ev.currentTarget.parentElement, tag.desc, { margin: this.opt.tooltipMargin });
								},
								mouseleave: (c, ev) => {
									this.tooltip = tooltip.mouseLeave(ev.currentTarget.parentElement);
								},
							},
						}, [
							n.component(new ModelTxt(tag, m => m.key)),
							n.component(onDelete ? new Elem(n => n.elem('button', {
								className: 'realmtagslist--delete',
								events: {
									click: (c, e) => {
										onDelete(tag, this.tags);
										e.stopPropagation();
									},
								},
							}, [
								n.component(new FAIcon('times')),
							])) : null),
						])),
						(m, c) => {
							for (let t of tagTypes) {
								c[m.type == t.key ? 'addClass' : 'removeClass']('realmtagslist--type-' + t.key);
							}
						},
					),
					{
						className: 'realmtagslist--list',
						subClassName: () => 'realmtagslist--item',
						horizontal: true,
					},
				)),
			])),
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
		if (this.tooltip) {
			this.tooltip.close();
			this.tooltip = null;
		}
	}
}

export default RealmTagsList;
