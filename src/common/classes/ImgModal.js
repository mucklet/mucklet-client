import { Elem } from 'modapp-base-component';
import Img from 'components/Img';
import './imgModal.scss';

class ImgModal {
	constructor(src, opt) {
		opt = Object.assign({
			onClose: null,
		}, opt);
		opt.className = (opt.className ? opt.className + ' ' : '') + 'imgmodal';
		opt.events = Object.assign({ click: () => this.close() }, opt.events);
		this.opt = opt;

		this.src = src;


		this._onEsc = this._onEsc.bind(this);

		this.comp = null;
	}

	open() {
		if (this.comp) return;

		document.addEventListener('keydown', this._onEsc);

		let elem = new Elem(n => n.elem('div', this.opt, [
			n.component(new Img(this.src, { className: 'imgmodal--img' })),
		]));
		elem.render(document.body);
		this.comp = elem;
		return this;
	}

	close() {
		if (!this.comp) return false;
		this.comp.unrender();
		this.comp = null;
		document.removeEventListener('keydown', this._onEsc);
		return true;
	}

	_onEsc(e) {
		if (!this.comp) return;
		if (e.key == 'Escape') {
			this.close();
		}
	}
}

export default ImgModal;
