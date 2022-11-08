import { Elem, Txt, Html } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import formatText from 'utils/formatText';
import formatDateTime from 'utils/formatDateTime';

class ToasterToast {
	constructor(opt, close) {
		this.opt = opt;
		this.close = close;
	}

	render(el) {
		this.elem = new Elem(n => {
			let children = [];
			let opt = this.opt;
			if (opt.closeOn == 'button') {
				children.push(n.elem('button', {
					className: 'toaster-toast--close iconbtn small',
					events: {
						click: () => this.close(),
					},
				}, [
					n.component(new FAIcon('close')),
				]));
			}
			if (opt.title) {
				children.push(n.elem('div', { className: 'toaster-toast--head' }, [
					n.component(new Txt(typeof opt.title == 'function' ? opt.title(this) : opt.title, { tagName: 'h3' })),
				]));
			}
			if (opt.content) {
				let ct = typeof opt.content;
				children.push(n.elem('div', { className: 'toaster-toast--content' }, [
					n.component(ct == 'function'
						? opt.content(this.close)
						: ct == 'string'
							? new Html(formatText(opt.content), { className: 'common--formattext' })
							: opt.content,
					),
				]));
			}
			return n.elem('div', { className: 'toaster-toast' }, [
				n.elem('div', {
					className: 'toaster-toast--cont ' + (opt.type || 'info') + (opt.closeOn == 'click' ? ' clickable' : ''),
					events: opt.closeOn == 'click'
						? { click: () => this.close() }
						: null,
					attributes: {
						title: formatDateTime(opt.time),
					},
				}, children),
			]);
		});

	    return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default ToasterToast;
