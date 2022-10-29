import { Elem, Txt } from 'modapp-base-component';
import { ModelHtml, ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import formatDateTime from 'utils/formatDateTime';
import errString from 'utils/errString';
import formatText from 'utils/formatText';

const txtOoc = l10n.l('pageMail.ooc', "ooc ");

class PageMailMailContent {
	constructor(module, mail, toggle) {
		this.module = module;
		this.mail = mail;
		this.toggle = toggle;
	}

	render(el) {
		this._setRead();
		this.elem = new Elem(n => {
			let msg = this.mail.message;
			let text = [];
			if (msg.ooc) {
				text.push(n.component(new Txt(txtOoc, { className: 'pagemail-mailcontent--ooc' })));
			}
			if (msg.pose) {
				text.push(n.component(new ModelTxt(this.mail, m => m.from.name, { className: 'charlog--char' })));
				if (msg.text[0] !== "'") {
					text.push(n.text(' '));
				}
			}
			text.push(n.component(new ModelHtml(msg, m => formatText(m.text), { tagName: 'span', className: 'common--formattext' + (msg.ooc ? ' charlog--ooc' : '') })));

			return n.elem('div', [
				n.elem('div', { className: 'badge--select pagemail-mailcontent--text' }, [
					n.elem('div', { className: 'badge--text' }, text)
				]),
				n.elem('div', { className: 'badge--divider' }),
				n.elem('div', { className: 'badge--select badge--margin' }, [
					n.elem('div', { className: 'flex-1' }, [
						n.elem('div', { className: 'flex-row' }, [
							n.component(new Txt(l10n.l('pageMail.to', "To"), { className: 'badge--iconcol badge--subtitle' })),
							n.component(new ModelTxt(this.mail.to, m => errString(m, m => (m.name + ' ' + m.surname), l10n.l('pageMail.unknown', "(Unknown)")), {
								className: 'badge--info badge--strong'
							}))
						]),
						n.elem('div', { className: 'flex-row' }, [
							n.component(new Txt(l10n.l('pageMail.read', "Read"), { className: 'badge--iconcol badge--subtitle' })),
							n.component(new ModelTxt(this.mail, m => m.read ? formatDateTime(new Date(m.received)) : l10n.l('pageMail.unread', "Reading..."), {
								className: 'badge--info badge--text'
							}))
						]),
					]),
					n.elem('button', { className: 'iconbtn medium tinyicon', events: {
						click: (c, ev) => {
							this.module.confirm.open(() => this._delete(), {
								title: l10n.l('pageMail.confirmDelete', "Confirm delete"),
								body: new Elem(n => n.elem('div', [
									n.component(new Txt(l10n.l('pageMail.deleteWatchBody', "Do you really wish delete this mail?"), { tagName: 'p' })),
								])),
								confirm: l10n.l('pageMail.delete', "Delete")
							});
							ev.stopPropagation();
						}
					}}, [
						n.component(new FAIcon('trash'))
					]),
				]),
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

	_setRead() {
		if (!this.mail.read) {
			this.mail.call('read');
		}
	}

	_delete() {
		this.mail.call('delete').catch(err => this.module.confirm.openError(err));
	}
}

export default PageMailMailContent;
