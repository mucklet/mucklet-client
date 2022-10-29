import { Txt, Input, Elem } from 'modapp-base-component';
import './editTxt.scss';

/**
 * EditTxt is an editable text.
 */
class EditTxt extends Elem {

	/**
	 * Creates an instance of EditTxt
	 * @param {string} value Value.
	 * @param {object} [opt] Optional parameters.
	 */
	constructor(value, opt) {
		opt = Object.assign({}, opt);
		opt.className = 'edittxt' + (opt.className ? ' ' + opt.className : '');
		super('div', opt);
		this.setRootNode(n => (
			n.elem('div', opt, [
				n.component('text', new Txt(value)),
				n.component('input', new Input(null, { events: { blur: () => this._onBlur() }})),
				n.elem('btn', { className: 'dialog--close iconbtn medium', events: { click: () => this.toggleEdit() }}, [
					n.component('icon', new FAIcon('pencil'))
				]),
			])
		));
		this.onEdit = opt.onEdit || null;
		this.editing = false;
	}

	render(el) {
		let rel = super.render(el);
		this._setEditing();
		return rel;
	}

	setValue(value) {
		this.getNode('text').setValue(value);
		return this;
	}

	toggleEdit(editing) {
		this.editing = typeof editing === 'undefined' ? !this.editing : !!editing;
		this._setEditing();
		return this;
	}

	_setEditing() {
		let el = this.getElement();
		if (!el) return;

		this.getNode('icon').setIcon(this.editing ? 'pencil' : 'close');
		if (this.editing) {
			this.addClass('editing');
		} else {
			this.removeClass('editing');
		}
	}

	_onBlur() {
		if (!this.editing) return;

		let inp = this.getNode('input');
		let v = inp.getValue();
		if (v != this.value) {
			this.setValue(v);
			if (this.onEdit) {
				this.onEdit(v);
			}
		}
		this.toggleEditing(false);
	}
}

export default EditTxt;
