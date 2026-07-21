import LabelToggleBox from 'components/LabelToggleBox';

class PageCustomThemeColor {
	constructor(model, theme, token, onChange) {
		this.model = model;
		this.theme = theme;
		this.token = token;
		this.onChange = onChange;
	}

	render(el) {

		this.elem = new LabelToggleBox(this.token.key, false, {
			className: 'common--formmargin',
			onChange: (v, c) => {},
		});
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default PageCustomThemeColor;
