import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import ModelCollapser from 'components/ModelCollapser';
import ColorInput from 'components/ColorInput';

class PageCustomThemeColor {
	constructor(model, theme, values, key, isRgba, onChange) {
		this.model = model;
		this.theme = theme;
		this.values = values;
		this.key = key;
		this.isRgba = isRgba;
		this.onChange = onChange;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.values,
			new ModelComponent(
				this.theme,
				new Elem(n => n.elem('div', { className: 'pagecustomtheme-color' }, [
					n.elem('btn', 'div', { className: 'badge btn' }, [
						n.elem('div', {
							className: 'badge--select badge--select-margin',
							events: {
								click: (c, ev) => this.model.set({ selected: this.key != this.model.selected ? this.key : null }),
							},
						}, [
							n.elem('dot', 'div', { className: 'pagecustomtheme-color--dot' }),
							n.elem('div', { className: 'badge--info' }, [
								n.component('key', new Txt(this.key, { tagName: 'div', className: 'pagecustomtheme-color--tokenkey badge--text' })),
							]),
						]),
						n.component(new ModelCollapser(this.model, [{
							condition: m => m.selected == this.key,
							factory: m => {
								let color = new ColorInput('', {
									className: 'pagecustomtheme-color--input',
									isRgba: this.isRgba,
									onChange: (value) => this.theme.set({ [this.key]: value || undefined }),
									inputName: 'pagecustomtheme--token-' + this.key.replaceAll('.', '-'),
								});

								return new Elem(n => n.elem('div', { className: 'pagecustomtheme-color--content' }, [
									n.elem('div', { className: 'badge--divider' }),
									n.component(new ModelComponent(
										this.values,
										new ModelComponent(
											this.theme,
											new ModelComponent(
												this.theme.getModel(),
												color,
												(m, c) => color.setDefaultValue(m.props[this.key]),
											),
											(m, c) => color.setValue(m.props[this.key]),
										),
										(m, c) => color.setPlaceholder(m.props[this.key]),
									)),
								]));
							},
						}])),
					]),
				])),
				(m, c, change) => change?.hasOwnProperty(this.key) && this._update(c),
			),
			(m, c, change) => (!change || change?.hasOwnProperty(this.key)) && this._update(c.getComponent()),
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_update(c) {
		let v = this.theme.props[this.key];
		c[v ? 'addClass' : 'removeClass']('isset');
		c.setNodeStyle('dot', 'background-color', v || this.values.props[this.key]);
	}
}

export default PageCustomThemeColor;
