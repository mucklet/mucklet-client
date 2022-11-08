import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import formatDateTime from 'utils/formatDateTime';

class PageAwakeCharContent {
	constructor(module, char, toggle) {
		this.module = module;
		this.char = char;
		this.toggle = toggle;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', [
			n.elem('div', { className: 'badge--select badge--margin' }, [
				n.elem('div', { className: 'badge--faicon' }, [
					n.component(new FAIcon('info')),
				]),
				n.elem('div', { className: 'badge--info small' }, [
					n.component(new Txt(l10n.l('pageAwake.lastAwake', "Woke up"), { tagName: 'div', className: 'badge--text' })),
					n.component(new ModelTxt(
						this.char,
						m => formatDateTime(new Date(m.lastAwake)),
						{ tagName: 'div', className: 'badge--text' },
					)),
				]),
				n.elem('button', { className: 'iconbtn medium tinyicon', events: {
					click: (c, ev) => {
						this.module.dialogAboutChar.open(this.char);
						ev.stopPropagation();
					},
				}}, [
					n.component(new FAIcon('user-circle')),
				]),
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

}

export default PageAwakeCharContent;
