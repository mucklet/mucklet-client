import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import PageCharSelectCharContent from './PageCharSelectCharContent';
import idleLevels, { getCharIdleLevel } from 'utils/idleLevels';

class PageCharSelectChar {
	constructor(module, char, chars, model, close, puppeteer) {
		this.char = char;
		this.chars = chars;
		this.module = module;
		this.model = model;
		this.close = close;
		this.puppeteer = puppeteer || null;
	}

	render(el) {
		let component = new Elem(n =>
			n.elem('div', { className: 'pagecharselect-char' }, [
				n.elem('btn', 'div', { className: 'badge btn large', events: {
					click: () => this._toggleActions(),
				}}, [
					n.elem('div', { className: 'badge--select' }, [
						n.component(this.module.avatar.newAvatar(this.char, { className: 'badge--icon' })),
						n.elem('div', { className: 'badge--info large' }, [
							n.elem('fullname', 'div', { className: 'pagecharselect-char--title badge--title badge--nowrap' }, [
								n.component(new ModelTxt(this.char, c => c.name)),
								n.text(' '),
								n.component(new ModelTxt(this.char, c => c.surname)),
							]),
							n.elem('div', { className: 'badge--strong badge--nowrap' }, [
								n.component(new ModelTxt(this.char, p => firstLetterUppercase(p.gender))),
								n.text(' '),
								n.component(new ModelTxt(this.char, p => firstLetterUppercase(p.species))),
							]),
							n.elem('div', { className: 'badge--text badge--nowrap' }, [
								n.component(new ModelComponent(
									this.char,
									new ModelTxt(null, m => m && m.name),
									(m, c) => c.setModel(m.inRoom),
								)),
							]),
						]),
					]),
					n.component('actions', new Collapser(null)),
				]),
			]),
		);

		let onboarding = this.module.onboarding.getModel();

		this.elem = new ModelComponent(
			onboarding,
			new ModelComponent(
				this.model,
				new ModelComponent(
					this.char,
					component,
					(m, c) => {
						c[m.state !== 'asleep' ? 'addNodeClass' : 'removeNodeClass']('btn', 'inactive');
						c[m.type == 'puppet' ? 'addNodeClass' : 'removeNodeClass']('btn', 'highlight');
						c[m.suspended ? 'addClass' : 'removeClass']('suspended');
						let lvl = getCharIdleLevel(m);
						for (let l of idleLevels) {
							c[m.state != 'asleep' && l == lvl ? 'addNodeClass' : 'removeNodeClass']('fullname', l.className);
						}
					},
				),
				(m, c, change) => {
					if (change && !change.hasOwnProperty('itemId')) return;

					c.getComponent().getNode('actions').setComponent(m.itemId === this.char.id
						? new PageCharSelectCharContent(this.module, this.char, (show) => this._toggleActions(show), this.close)
						: null,
					);
					if (change) {
						this._setTip(component, onboarding);
					}
				},
			),
			(m, c) => this._setTip(component, onboarding),
			{ postrenderUpdate: true },
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this._closeTip();
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

	_setTip(component, onboarding) {
		let el = component.getElement();

		// To show the onboarding tip, all conditions must be fulfilled:
		if (el // We are rendered
			&& onboarding.wakeupChar // The step is to wakeup a character
			&& !this.model.itemId // No character is selected
			&& this.chars.length && this.chars.atIndex(0) == this.char // It is the first owned character
		) {
			this._openTip(el);
		} else {
			this._closeTip();
		}
	}

	_openTip(el) {
		this.module.onboarding.openTip('pageCharSelectSelect', el, {
			priority: 20,
			position: [ 'right', 'bottom' ],
			title: l10n.l('pageCharSelect.getStarted', "Get started"),
			content: l10n.l('pageCharSelect.selectByClicking', "You've got a new character! Click on the character to select it."),
		});
	}

	_closeTip() {
		this.module.onboarding.closeTip('pageCharSelectSelect');
	}
}

export default PageCharSelectChar;
