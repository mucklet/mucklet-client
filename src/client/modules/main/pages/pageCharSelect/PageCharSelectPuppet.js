import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import PageCharSelectPuppetContent from './PageCharSelectPuppetContent';
import idleLevels from 'utils/idleLevels';

class PageCharSelectPuppet {
	constructor(module, puppeteer, model, close) {
		this.puppeteer = puppeteer;
		this.puppet = puppeteer.puppet;
		this.module = module;
		this.model = model;
		this.close = close;
		this.itemId = this.puppet.id + '_' + this.puppeteer.char.id;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new ModelComponent(
				this.puppet,
				new Elem(n =>
					n.elem('div', { className: 'pagecharselect-puppet' }, [
						n.elem('btn', 'div', { className: 'pagecharselect-puppet--btn badge btn large highlight', events: {
							click: () => this._toggleActions(),
						}}, [
							n.elem('div', { className: 'badge--select' }, [
								n.component(this.module.avatar.newAvatar(this.puppet, { className: 'badge--icon' })),
								n.elem('div', { className: 'badge--info large' }, [
									n.elem('fullname', 'div', { className: 'pagecharselect-puppet--title badge--title badge--nowrap' }, [
										n.component(new ModelTxt(this.puppet, c => c.name)),
										n.text(' '),
										n.component(new ModelTxt(this.puppet, c => c.surname)),
									]),
									n.elem('div', { className: 'badge--strong badge--nowrap' }, [
										n.component(new ModelTxt(this.puppet, p => firstLetterUppercase(p.gender))),
										n.text(' '),
										n.component(new ModelTxt(this.puppet, p => firstLetterUppercase(p.species))),
									]),
									n.component(new ModelComponent(
										this.puppeteer.char,
										new Elem(n => n.elem('div', { className: 'badge--text badge--nowrap' }, [
											n.component('name', new Txt()),
											n.text(' '),
											n.component('surname', new Txt()),
										])),
										(m, c) => {
											c[m.suspended ? 'addClass' : 'removeClass']('suspended');
											c.getNode('name').setText(m.name);
											c.getNode('surname').setText(m.surname);
										},
									)),
								]),
							]),
							n.component('actions', new Collapser(null)),
						]),
					]),
				),
				(m, c) => {
					c[m.state !== 'asleep' ? 'addNodeClass' : 'removeNodeClass']('btn', 'inactive');
					for (let i = 0; i < idleLevels.length; i++) {
						let lvl = idleLevels[i];
						c[m.state != 'asleep' && i == m.idle ? 'addNodeClass' : 'removeNodeClass']('fullname', lvl.className);
					}
				},
			),
			(m, c, change) => {
				if (change && !change.hasOwnProperty('itemId')) return;

				let isOpen = m.itemId === this.itemId;
				c.getComponent()[isOpen ? 'addNodeClass' : 'removeNodeClass']('btn', 'open');
				c.getComponent().getNode('actions').setComponent(isOpen
					? new PageCharSelectPuppetContent(this.module, this.puppeteer, (show) => this._toggleActions(show), this.close)
					: null,
				);
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

	_toggleActions(show) {
		show = typeof show == 'undefined'
			? !this.model.itemId || this.model.itemId != this.itemId
			: !!show;

		this.model.set({ itemId: show ? this.itemId : null });
	}

}

export default PageCharSelectPuppet;
