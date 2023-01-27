import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import formatDateTime from 'utils/formatDateTime';
import errString from 'utils/errString';

const txtActivityHelp = l10n.l('pageTickets.help', "Help");
const txtActivitySent = l10n.l('pageTickets.sent', "Sent");
const txtType = l10n.l('pageTickets.type', "Type");

class PageTicketsActivity {
	constructor(module, ticket, activity) {
		this.module = module;
		this.ticket = ticket;
		this.activity = activity;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.activity,
			new Elem(n => n.elem('div', { className: 'pagetickets-activity' }, [
				n.elem('div', { className: 'badge--divider' }),
				n.elem('div', { className: 'badge--select' }, [
					n.elem('div', { className: 'badge--info-nopad' }, [
						n.elem('div', { className: 'flex-row' }, [
							n.component('from', new Txt("", { className: 'badge--iconcol badge--subtitle' })),
							n.component(new ModelTxt(this.activity.char, m => errString(m, m => (m.name + ' ' + m.surname), l10n.l('pageTickets.unknown', "(Unknown)")), {
								className: 'badge--info badge--strong',
							})),
						]),
						n.component('puppeteer', new Collapser()),
						n.elem('div', { className: 'flex-row' }, [
							n.component('type', new Txt("", { className: 'badge--iconcol badge--subtitle' })),
							n.component('created', new Txt("", { className: 'badge--info badge--text' })),
						]),
					]),
					n.elem('div', { className: 'badge--tools' }, [
						n.elem('button', { className: 'pagetickets-activity--copyid iconbtn medium tinyicon', events: {
							click: (c, ev) => {
								this.module.copyCharId.copy(this.activity.char);
								ev.stopPropagation();
							},
						}}, [
							n.component(new FAIcon('clipboard')),
						]),
					]),
				]),
				n.component('activity', new Collapser()),
			])),
			(m, c, change) => {
				if (!change || change.hasOwnProperty('type') || change.hasOwnProperty('params')) {
					let activityNode = c.getNode('activity');
					let typ = this.module.self.getActivityTypes().get(m.type);
					activityNode.setComponent(typ
						? typ?.componentFactory(m.params, m) || null
						: m.params
							? new Elem(n => n.elem('div', [
								n.elem('div', { className: 'flex-row' }, [
									n.component(new Txt(txtType, { className: 'badge--iconcol badge--subtitle' })),
									n.component(new ModelTxt(this.activity, m => m.type, {
										className: 'badge--info badge--text',
									})),
								]),
								n.component(new ModelTxt(m, m => m.params ? JSON.stringify(m.params, null, 2) : "", { tagName: 'pre', className: 'badge--text common--formattext' })),
							]))
							: null,
					);
					c.getNode('from').setText(typ?.fromTxt || txtActivityHelp);
					c.getNode('type').setText(typ?.typeTxt || txtActivitySent);
				}
				if (!change || change.hasOwnProperty('created')) {
					c.getNode('created').setText(formatDateTime(new Date(m.created)));
				}
				if (!change || change.hasOwnProperty('puppeteer')) {
					c.getNode('puppeteer').setComponent(m.puppeteer
						? new Elem(n => n.elem('div', { className: 'flex-row' }, [
							n.component(new Txt(l10n.l('pageTickets.ctrl', "Ctrl"), { className: 'badge--iconcol badge--subtitle' })),
							n.component(new ModelTxt(m.puppeteer, m => errString(m, m => (m.name + ' ' + m.surname), l10n.l('pageTickets.unknown', "(Unknown)")), {
								className: 'badge--info badge--text',
							})),
						]))
						: null,
					);
				}
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
}

export default PageTicketsActivity;
