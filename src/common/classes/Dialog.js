import { Elem, Txt } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import './dialog.scss';

const BASE_ZINDEX = 500;
let openDialogs = [];

function setZ(elem, z) {
	elem.setAttribute('style', 'z-index:' + z);
}

document.addEventListener('keydown', e => {
	let l = openDialogs.length;
	if (e.key == 'Escape' && l) {
		openDialogs[l - 1].close();
	}
});

let overlay = new Elem(n => n.elem('div', { className: 'dialog--overlay' }));

class Dialog {
	constructor(opt) {
		this.opt = Object.assign({
			content: null,
			title: null,
			onClose: null,
			animated: true,
		}, opt);

		this.opt.className = (this.opt.className ? this.opt.className + ' ' : '') + 'dialog' + (this.opt.animated ? '' : ' dialog--noanim');

		this.comp = null;
	}

	open() {
		if (this.comp) return;

		let l = openDialogs.length;
		let idx = BASE_ZINDEX + l * 2;
		if (!l) {
			overlay.render(document.body);
		}
		setZ(overlay, idx);

		this.content = typeof this.opt.content == 'function' ? this.opt.content(this) : this.opt.content;
		this.comp = new Elem(n => n.elem('div', { className: 'dialog--container' }, [
			n.elem('div', this.opt, [
				n.elem('div', { className: 'dialog--head' }, [
					n.elem('button', { className: 'dialog--close iconbtn medium', events: { click: () => this.close() }}, [
						n.component(new FAIcon('close')),
					]),
					n.component(new Txt(typeof this.opt.title == 'function' ? this.opt.title(this) : this.opt.title, { tagName: 'h2' })),
				]),
				n.elem('div', { className: 'dialog--content-wrap' }, [
					n.elem('div', { className: 'dialog--content' }, [
						n.component(this.content),
					]),
				]),
			]),
		]));

		setZ(this.comp, idx + 1);
		openDialogs.push(this);

		this.comp.render(document.body);
		return this;
	}

	close() {
		if (!this.comp) return false;

		let i = openDialogs.indexOf(this);
		if (i == -1) {
			throw new Error("Dialog not found in openDialogs array");
		}

		if (this.opt.onClose) {
			if (this.opt.onClose(this, this.content) === false) {
				return false;
			}
		}

		openDialogs.splice(i, 1);
		let l = openDialogs.length;
		while (i < l) {
			setZ(openDialogs[i].comp, BASE_ZINDEX + i * 2 + 1);
			i++;
		}
		if (l) {
			setZ(overlay, BASE_ZINDEX + l * 2 - 2);
		} else {
			overlay.unrender();
		}

		this.comp.unrender();
		this.comp = null;
		this.content = null;
		return true;
	}

	getContent() {
		return this.content || null;
	}

	/**
	 * Returns the container element for the dialog.
	 * @returns {Component} Container element
	 */
	getContainer() {
		return this.comp;
	}
}

export default Dialog;
