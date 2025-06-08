import { Elem, Txt } from 'modapp-base-component';
import SimpleBar from 'components/SimpleBar';

/**
 * EditScriptErrors renders the compile errors
 */
class EditScriptErrors {

	constructor(errText) {
		this.txt = new Txt(errText, { className: 'editscript-errors--text' });
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'editscript-errors' }, [
			n.elem('div', { className: 'editscript-errors--cont' }, [
				n.component(new SimpleBar(
					this.txt,
					{
						className: 'editscript-errors--simplebar',
						autoHide: false,
					},
				)),
			]),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	setError(errText) {
		this.txt.setText(errText);
		return this;
	}
}

export default EditScriptErrors;
