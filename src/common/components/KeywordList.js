import { Elem } from 'modapp-base-component';
import { CollectionList, ModelTxt } from 'modapp-resource-component';
import FAIcon from './FAIcon';
import './keywordList.scss';

/**
 * KeywordList shows a list of keywords.
 */
class KeywordList {

	/**
	 * Creates an instance of KeywordList
	 * @param {Model} keywords Model of char keywords.
	 * @param {object} [opt] Optional parameters.
	 * @param {function} [opt.keywordCallback] Callback function to get the keyword: function(keyword) => {String} . Defaults to: k => k
	 * @param {boolean} [opt.onEdit] Callback called on edit icon click. Defaults to hiding the edit icon. function(keyword, pref, keywords)
	 * @param {boolean} [opt.onDelete] Callback called on delete icon click. Defaults to hiding the delete icon. function(keyword, pref, keywords)
	 * @param {EventBus} [opt.eventBus] Event bus.
	 */
	constructor(keywords, opt) {
		opt = Object.assign({ horizontal: true }, opt);
		opt.className = 'keywordlist' + (opt.className ? ' ' + opt.className : '');
		this.opt = opt;
		this.keywords = keywords;
	}


	render(el) {
		let onEdit = this.opt.onEdit;
		let onDelete = this.opt.onDelete;
		let keywordCallback = this.opt.keywordCallback || (k => k);
		this.elem = new Elem(n => n.elem('div', { className: this.opt.className }, [
			n.component(new CollectionList(
				this.keywords,
				keyword => new Elem(n => n.elem('div', {
					className: 'keywordlist--keyword ' + (onEdit ? ' editable' : ''),
					events: {
						click: (c, ev) => {
							if (onEdit) {
								onEdit(keyword, this.keywords);
								ev.stopPropagation();
							}
						}
					}
				}, [
					n.component(new ModelTxt(keyword, keywordCallback)),
					n.component(onDelete ? new Elem(n => n.elem('button', {
						className: 'keywordlist--delete',
						events: {
							click: (c, e) => {
								onDelete(keyword, this.keywords);
								e.stopPropagation();
							}
						}
					}, [
						n.component(new FAIcon('times'))
					])) : null)
				])),
				{
					className: 'keywordlist--list',
					subClassName: () => 'keywordlist--item',
					horizontal: true
				}
			))
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default KeywordList;
