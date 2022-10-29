import { Elem, Transition, Context, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent, ModelTxt } from 'modapp-resource-component';
import { Model, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import FAIcon from 'components/FAIcon';
import PageMailMail from './PageMailMail';

const defaultLimit = 25;

class PageMailComponent {
	constructor(module, state, close) {
		this.module = module;
		state.mailId = state.mailId || null;
		state.offset = state.offset || 0;
		state.count = null;
		this.state = state;
		this.close = close;
		this.model = null;
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });

		let noMailComponent = new Txt(l10n.l('pageMail.noMail', "No mail here"), { className: 'pagemail--nomail' });
		let mailCountComponent = new Elem(n => n.elem('div', { className: 'pagemail--page' }, [
			n.component(new Txt(l10n.l('pageMail.mail', "Mail"))),
			n.text(' '),
			n.component(new ModelTxt(this.model, m => m.offset + 1)),
			n.text(" – "),
			n.component(new ModelTxt(this.model, (m, c) => m.count
				? m.offset + (m.count > defaultLimit ? defaultLimit : m.count)
				: c.getText()
			))
		]));

		this.elem = new Elem(n => n.elem('div', { className: 'pagemail' }, [
			n.component(new ModelComponent(
				this.model,
				new CollectionComponent(
					null,
					new Elem(n => n.elem('div', { className: 'pagemail--head flex-row flex-center margin4' }, [
						n.component(new ModelComponent(
							this.model,
							new Fader(null, { className: 'flex-1' }),
							(m, c) => c.setComponent(m.mails
								? m.count || m.offset // If we have mail, or are on a later page.
									? mailCountComponent
									: noMailComponent
								: null
							)
						)),
						n.component(new ModelComponent(
							this.model,
							new Elem(n => n.elem('button', { className: 'iconbtn medium light', events: {
								click: () => this._loadMail(this.model.offset < defaultLimit ? 0 : this.model.offset - defaultLimit)
							}}, [
								n.component(new FAIcon('angle-left')),
							])),
							(m, c) => c.setProperty('disabled', m.offset ? null : 'disabled')
						)),
						n.component(new ModelComponent(
							this.model,
							new Elem(n => n.elem('button', { className: 'iconbtn medium light', events: {
								click: () => this._loadMail(this.model.offset + defaultLimit)
							}}, [
								n.component(new FAIcon('angle-right')),
							])),
							(m, c) => c.setProperty('disabled', m.count > defaultLimit ? null : 'disabled')
						)),
					])),
					(col, m) => this.model.set({ count: col ? col.length : null })
				),
				(m, c, change) => c.setCollection(m.mails)
			)),
			n.component('list', new Transition(null))
		]));
		this.elem.render(el);

		this._loadMail(this.model.offset);
	}

	unrender() {
		if (this.elem) {
			let m = this.model;
			Object.assign(this.state, { mailId: m.mailId, offset: m.offset });
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_loadMail(offset) {
		if (!this.model || this.loadingOffset === offset) return;

		if (this.model.mails && this.offset === offset) {
			this.loadingOffset = null;
			return;
		}

		this.loadingOffset = offset;

		this.module.login.getLoginPromise().then(user => {
			if (!this.model || offset !== this.loadingOffset) return;
			this.module.api.get('mail.player.' + user.id + '.inbox?offset=' + offset + '&limit=' + (defaultLimit + 1)).then(mails => {
				if (!this.model || offset !== this.loadingOffset) return;

				let m = this.model;
				let dir = offset - m.offset;
				let cb = m.mails
					? dir > 0
						? 'slideLeft'
						: dir < 0
							? 'slideRight'
							: 'fade'
					: 'fade';
				this.elem.getNode('list')[cb](new Elem(n => n.elem('div', [
					n.component(new Context(
						() => new CollectionWrapper(mails, { begin: 0, end: defaultLimit, eventBus: this.module.self.app.eventBus }),
						mails => mails.dispose(),
						mails => new CollectionList(
							mails,
							m => new PageMailMail(this.module, m, this.model),
							{ className: 'pagemail--list' }
						)
					))
				])));

				this.loadingOffset = null;
				this.model.set({ mails, offset });
			});
		});
	}

	_getTo() {
		let m = this.model;
		if (m) {
			let ms = m.mails;
			if (ms) {
				return m.offset + (ms.length > defaultLimit ? defaultLimit : ms.length);
			}
		}
		return '...';
	}

	_setNextDisabled(c) {
		let m = this.model;
		c.setProperty('disabled', m && m.mails && m.mails.length > m.offset
			? null
			: 'disabled'
		);
	}
}

export default PageMailComponent;
