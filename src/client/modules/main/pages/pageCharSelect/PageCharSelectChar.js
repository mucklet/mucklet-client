import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import PageCharSelectCharContent from './PageCharSelectCharContent';
import idleLevels from 'utils/idleLevels';

class PageCharSelectChar {
	constructor(module, char, model, close, puppeteer) {
		this.char = char;
		this.module = module;
		this.model = model;
		this.close = close;
		this.puppeteer = puppeteer || null;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new ModelComponent(
				this.char,
				new Elem(n =>
					n.elem('div', { className: 'pagecharselect-char' }, [
						n.elem('btn', 'div', { className: 'badge btn large', events: {
							click: () => this._toggleActions()
						}}, [
							n.elem('div', { className: 'badge--select' }, [
								n.component(this.module.avatar.newAvatar(this.char, { className: 'badge--icon' })),
								n.elem('div', { className: 'badge--info large' }, [
									n.elem('fullname', 'div', { className: 'pagecharselect-char--title badge--title badge--nowrap' }, [
										n.component(new ModelTxt(this.char, c => c.name)),
										n.text(' '),
										n.component(new ModelTxt(this.char, c => c.surname))
									]),
									n.elem('div', { className: 'badge--strong badge--nowrap' }, [
										n.component(new ModelTxt(this.char, p => firstLetterUppercase(p.gender))),
										n.text(' '),
										n.component(new ModelTxt(this.char, p => firstLetterUppercase(p.species)))
									]),
									n.elem('div', { className: 'badge--text badge--nowrap' }, [
										n.component(new ModelComponent(
											this.char,
											new ModelTxt(null, m => m && m.name),
											(m, c) => c.setModel(m.inRoom)
										))
									]),
								])
							]),
							n.component('actions', new Collapser(null))
						])
					])
				),
				(m, c) => {
					c[m.state !== 'asleep' ? 'addNodeClass' : 'removeNodeClass']('btn', 'inactive');
					c[m.type == 'puppet' ? 'addNodeClass' : 'removeNodeClass']('btn', 'highlight');
					c[m.suspended ? 'addClass' : 'removeClass']('suspended');
					for (let i = 0; i < idleLevels.length; i++) {
						let lvl = idleLevels[i];
						c[m.state != 'asleep' && i == m.idle ? 'addNodeClass' : 'removeNodeClass']('fullname', lvl.className);
					}
				}
			),
			(m, c, change) => {
				if (change && !change.hasOwnProperty('itemId')) return;

				c.getComponent().getNode('actions').setComponent(m.itemId === this.char.id
					? new PageCharSelectCharContent(this.module, this.char, (show) => this._toggleActions(show), this.close)
					: null
				);
			}
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
			? !this.model.itemId || this.model.itemId != this.char.id
			: !!show;

		this.model.set({ itemId: show ? this.char.id : null });
	}

}

export default PageCharSelectChar;
