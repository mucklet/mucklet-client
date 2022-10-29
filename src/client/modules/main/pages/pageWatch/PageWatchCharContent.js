import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import formatDateTime from 'utils/formatDateTime';
import firstLetterUppercase from 'utils/firstLetterUppercase';

class PageWatchCharContent {
	constructor(module, watch, toggle, close) {
		this.module = module;
		this.watch = watch;
		this.char = watch.char;
		this.toggle = toggle;
		this.close = close;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', [
			n.elem('div', { className: 'badge--select badge--margin' }, [
				n.elem('div', { className: 'badge--faicon' }, [
					n.component(new FAIcon('info'))
				]),
				n.elem('div', { className: 'badge--info small' }, [
					n.elem('div', { className: 'badge--text badge--nowrap' }, [
						n.component(new ModelTxt(this.char, p => firstLetterUppercase(p.gender))),
						n.text(' '),
						n.component(new ModelTxt(this.char, p => firstLetterUppercase(p.species)))
					]),
					n.component(new ModelTxt(
						this.watch,
						m => l10n.l('pageWatch.addedTime', "Added {time}", { time: formatDateTime(new Date(m.created)) }),
						{ tagName: 'div', className: 'badge--text' }
					)),
				]),
				n.elem('button', { className: 'iconbtn medium tinyicon', events: {
					click: (c, ev) => {
						this.module.confirm.open(() => this._delete(), {
							title: l10n.l('pageWatch.confirmDelete', "Confirm delete"),
							body: new Elem(n => n.elem('div', [
								n.component(new Txt(l10n.l('pageWatch.deleteWatchBody', "Do you really wish delete this watch?"), { tagName: 'p' })),
								n.elem('p', [ n.component(new ModelTxt(this.char, m => (m.name + ' ' + m.surname).trim(), { className: 'dialog--strong' })) ])
							])),
							confirm: l10n.l('pageWatch.delete', "Delete")
						});
						ev.stopPropagation();
					}
				}}, [
					n.component(new FAIcon('trash'))
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

	_delete() {
		this.watch.call('delete').catch(err => this.module.confirm.openError(err));
	}
}

export default PageWatchCharContent;
