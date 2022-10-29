import { Elem, Txt } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import Fader from 'components/Fader';
import './screendialog.scss';

/**
 * ScreenDialog draws a screen dialog
 */
class ScreenDialog {
	constructor(component, opt) {
		opt = opt || {};
		this.title = opt.title;
		this.close = opt.close;
		this.size = opt.size;
		this.body = new Fader(null, { className: 'screendialog--body' });
		this.setComponent(component);
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'screendialog' }, [
			n.elem('div', { className: 'screendialog--container' + (this.size ? ' ' + this.size : '') }, [
				this.title || this.close ? n.elem('div', { className: 'screendialog--head' }, [
					this.close ? n.elem('button', { className: 'screendialog--close iconbtn medium', events: { click: () => this.close() }}, [
						n.component(new FAIcon('close'))
					]) : n.component(null),
					n.component(new Txt(this.title || "", { tagName: 'h2' }))
				]) : n.component(null),
				n.component(this.body)
			])
		]));
		this.elem.render(el);
	}

	getComponent() {
		return this.body.getComponent();
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	setComponent(component) {
		this.body.setComponent(component);
		return this;
	}
}

export default ScreenDialog;
