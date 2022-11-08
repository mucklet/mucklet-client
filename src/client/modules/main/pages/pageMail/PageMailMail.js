import { Elem } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import formatDateTime from 'utils/formatDateTime';
import PageMailMailContent from './PageMailMailContent';

class PageMailMessage {
	constructor(module, mail, model) {
		this.module = module;
		this.mail = mail;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.mail,
			new Elem(n => n.elem('div', { className: 'pagemail-mail' }, [
				n.elem('badge', 'div', { className: 'pagemail-mail--badge badge btn margin4', events: {
					click: () => this._toggleInfo(),
				}}, [
					n.elem('div', { className: 'badge--select' }, [
						n.component(this.module.avatar.newAvatar(this.mail.from, { size: 'small', className: 'badge--icon' })),
						n.elem('div', { className: 'badge--info' }, [
							n.elem('div', { className: 'badge--title badge--nowrap' }, [
								n.component(new ModelTxt(this.mail, m => (m.from.name + ' ' + m.from.surname).trim())),
							]),
							n.elem('div', { className: 'badge--text badge--nowrap' }, [
								n.component(new ModelTxt(this.mail, m => formatDateTime(new Date(m.received)))),
							]),
						]),
					]),
					n.component(new ModelComponent(
						this.model,
						new Collapser(null),
						(m, c, change) => {
							if (change && !change.hasOwnProperty('mailId')) return;
							c.setComponent(m.mailId === this.mail.getResourceId()
								? new PageMailMailContent(this.module, this.mail, (show) => this._toggleInfo(show))
								: null,
							);
						},
					)),
				]),
			])),
			(m, c) => {
				c[m.read ? 'removeNodeClass' : 'addNodeClass']('badge', 'unread');
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

	_toggleInfo(show) {
		let rid = this.mail.getResourceId();
		show = typeof show == 'undefined'
			? !this.model.mailId || this.model.mailId != rid
			: !!show;

		this.model.set({ mailId: show ? rid : null });
	}
}

export default PageMailMessage;
