import { Elem, Context } from 'modapp-base-component';
import { CollectionList, ModelTxt, ModelComponent } from 'modapp-resource-component';
import { ModelToCollection, ModelWrapper } from 'modapp-resource';
import { isResError } from 'resclient';
import FAIcon from './FAIcon';
import * as tooltip from 'utils/tooltip';
import './charTagsList.scss';

function staticClone(tags) {
	tags = Object.assign({}, tags?.props || tags);
	for (let k in tags) {
		let t = tags[k];
		tags[k] = t && t.props ? Object.assign({}, t.props) : t;
	}
	return tags;
}

function isRoleTag(tag) {
	return !!(tag.role || tag.idRole);
}

const prefOrder = {
	like: 0,
	dislike: 1,
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
 * CharTagsList shows a list of tags.
 */
class CharTagsList {

	/**
	 * Creates an instance of CharTagsList
	 * @param {Model} tags Model of char tags.
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.static] Boolean telling if the tags should be static, not changing on updates. Defaults to false.
	 * @param {boolean} [opt.onEdit] Callback called on edit icon click. Defaults to hiding the edit icon. function(tag, pref, tags)
	 * @param {boolean} [opt.onDelete] Callback called on delete icon click. Defaults to hiding the delete icon. function(tag, pref, tags)
	 * @param {string} [opt.tooltipMargin] Tooltip margin to use. May be 'm'.
	 * @param {EventBus} [opt.eventBus] Event bus.
	 */
	constructor(tags, opt) {
		opt = Object.assign({ horizontal: true }, opt);
		opt.className = 'chartagslist' + (opt.className ? ' ' + opt.className : '');
		if (opt.static) {
			tags = staticClone(tags);
		}
		this.opt = opt;
		this.tags = tags;
	}


	render(el) {
		let onEdit = this.opt.onEdit;
		let onDelete = this.opt.onDelete;
		this.elem = new Context(
			() => new ModelToCollection(new ModelWrapper(this.tags, {
				map: (k, v) => ({ key: k, pref: k.slice(k.lastIndexOf('_') + 1), tag: v }),
				filter: (k, v) => !isResError(v),
				eventBus: this.opt.eventBus,
			}), {
				compare: (a, b) => {
					let at = a.value.tag;
					let bt = b.value.tag;
					return isRoleTag(bt) - isRoleTag(at) ||
						prefOrder[a.value.pref] - prefOrder[b.value.pref] ||
						bt.custom - at.custom ||
						at.key.localeCompare(bt.key) ||
						at.id.localeCompare(bt.id);
				},
			}),
			col => {
				col.getModel().dispose();
				col.dispose();
			},
			col => new Elem(n => n.elem('div', { className: this.opt.className }, [
				n.component(new CollectionList(
					col,
					cont => new ModelComponent(
						cont.tag,
						new Elem(n => n.elem('div', {
							className: 'chartagslist--tag ' + (isRoleTag(cont.tag) ? 'title' : cont.pref) + (onEdit ? ' editable' : ''),
							events: onEdit
								? {
									click: (c, ev) => {
										onEdit(cont.tag, cont.pref, this.tags);
										ev.stopPropagation();
									},
								}
								: {
									click: (c, ev) => {
										this.tooltip = tooltip.click(ev.currentTarget.parentElement, cont.tag.desc, { margin: this.opt.tooltipMargin });
										ev.stopPropagation();
									},
									mouseenter: (c, ev) => {
										this.tooltip = tooltip.mouseEnter(ev.currentTarget.parentElement, cont.tag.desc, { margin: this.opt.tooltipMargin });
									},
									mouseleave: (c, ev) => {
										this.tooltip = tooltip.mouseLeave(ev.currentTarget.parentElement);
									},
								},
						}, [
							n.component(new ModelTxt(cont.tag, m => m.key)),
							n.component(onDelete ? new Elem(n => n.elem('button', {
								className: 'chartagslist--delete',
								events: {
									click: (c, e) => {
										onDelete(cont.tag, cont.pref, this.tags);
										e.stopPropagation();
									},
								},
							}, [
								n.component(new FAIcon('times')),
							])) : null),
						])),
						(m, c) => {
							c[m.desc ? 'addClass' : 'removeClass']('hasdesc');
							c[m.custom ? 'addClass' : 'removeClass']('custom');
						},
					),
					{
						className: 'chartagslist--list',
						subClassName: () => 'chartagslist--item',
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

export default CharTagsList;
