import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import ModelCollapser from 'components/ModelCollapser';
import ColorInput from 'components/ColorInput';

class PageCustomThemeColor {
	constructor(model, theme, token, onChange) {
		this.model = model;
		this.theme = theme;
		this.token = token;
		this.onChange = onChange;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.theme,
			new Elem(n => n.elem('div', { className: 'pagecustomtheme-color' }, [
				n.elem('btn', 'div', { className: 'badge btn' }, [
					n.elem('div', {
						className: 'badge--select badge--select-margin',
						events: {
							click: (c, ev) => this.model.set({ selected: this.token.key != this.model.selected ? this.token.key : null }),
						},
					}, [
						n.elem('dot', 'div', { className: 'pagecustomtheme-color--dot' }),
						n.elem('div', { className: 'badge--info' }, [
							n.component('key', new Txt(this.token.key, { tagName: 'div', className: 'pagecustomtheme-color--tokenkey badge--text' })),
						]),
					]),
					n.component(new ModelCollapser(this.model, [{
						condition: m => m.selected == this.token.key,
						factory: m => new Elem(n => n.elem('div', { className: 'pagecustomtheme-color--content' }, [
							n.elem('div', { className: 'badge--divider' }),
							n.component(new ModelComponent(
								this.theme,
								new ModelComponent(
									this.theme.getModel(),
									new ColorInput('', {
										className: 'pagecustomtheme-color--input',
										onChange: (value) => this.theme.set({ [this.token.key]: value || undefined }),
										inputName: 'pagecustomtheme--token-' + this.token.key.replaceAll('.', '-'),
										placeholder: this.token.value,
									}),
									(m, c) => c.setDefaultValue(m.props[this.token.key]),
								),
								(m, c) => c.getComponent().setValue(m.props[this.token.key]),
							)),
						])),
					}])),
				]),
			])),
			(m, c, change) => {
				if (!change || change.hasOwnProperty(this.token.key)) {
					let v = this.theme.props[this.token.key];
					c[v ? 'addClass' : 'removeClass']('isset');
					c.setNodeStyle('dot', 'background-color', this.theme.props[this.token.key] || this.token.value);
				}
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default PageCustomThemeColor;
