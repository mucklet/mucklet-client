import { RootElem, Input } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import CheckedSvg from 'components/CheckedSvg';
import normalizeHexColor from 'utils/normalizeHexColor';
import './colorInput.scss';

class ColorInput extends RootElem{
	constructor(value, opt) {
		super();

		this.opt = opt || {};
		this.isRgba = !!this.opt.isRgba;
		this.value = normalizeHexColor(value || '', this.isRgba);
		this.defaultValue = this.opt.hasOwnProperty('defaultValue') ? normalizeHexColor(this.opt.defaultValue, this.isRgba) : this.value;
		this.placeholder = normalizeHexColor(this.opt.placeholder, this.isRgba) || (this.isRgba ? '#00000000' : '#000000');

		super.setRootNode(n => n.elem('div', Object.assign({}, this.opt, { className: 'colorinput' + (this.opt.className ? ' ' + this.opt.className : '') }), [
			n.elem('div', { className: 'colorinput--color' }, [
				n.component(this.isRgba ? new CheckedSvg(4, 4, { className: 'colorinput--checker' }) : null),
				n.elem('preview', 'div', { className: 'colorinput--preview' }),
			]),
			n.elem('div', { className: 'colorinput--inputcont' }, [
				n.component('input', new Input(this.value, {
					className: 'colorinput--input',
					attributes: {
						name: this.opt?.inputName,
						placeholder: this.placeholder,
						maxlength: this.isRgba ? 9 : 7,
						spellcheck: false,
					},
					events: {
						input: (c) => {
							let v = c.getValue();
							let color = normalizeHexColor(v, this.isRgba);
							c[!v || color ? 'removeClass' : 'addClass']('input--incomplete');

							if (!v) {
								this.setValue('');
							} else if (color) {
								this.setValue(color);
								c.setValue(color);
							}
						},
						blur: c => {
							c.setValue(this.value || '');
							c.removeClass('input--incomplete');
						},
					},
				})),
				n.elem('reset', 'button', {
					className: 'colorinput--reset default-500 iconbtn small tinyicon',
					attributes: {
						type: 'button',
					},
					events: {
						click: () => this.setValue(this.defaultValue),
					},
				}, [
					n.component(new FAIcon('undo')),
				]),
			]),
		]));

	}

	setValue(value) {
		value = normalizeHexColor(value, this.isRgba) || '';
		if (this.value == value) {
			return;
		}
		this.value = value;
		this.opt?.onChange?.(value);

		this._update();
	}

	setDefaultValue(defaultValue) {
		defaultValue = normalizeHexColor(defaultValue, this.isRgba) || '';
		if (this.defaultValue == defaultValue) {
			return;
		}
		this.defaultValue = defaultValue;
		this._update();
	}

	setPlaceholder(placeholder) {
		placeholder = normalizeHexColor(placeholder, this.isRgba) || (this.isRgba ? '#00000000' : '#000000');
		if (this.placeholder == placeholder) {
			return;
		}
		this.placeholder = placeholder;
		this._update();
	}

	_update() {
		// Set disable button
		this._rootElem.setNodeProperty('reset', 'disabled', this.value == this.defaultValue ? 'disabled' : null);
		this._rootElem.setNodeStyle('preview', 'backgroundColor', this.value || this.placeholder);

		let input = this._rootElem.getNode('input');
		input.setValue(this.value || '');
		input.removeClass('input--incomplete');
		input.setAttribute('placeholder', this.placeholder);
	}
}

export default ColorInput;
