import { Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import formatDateTime from 'utils/formatDateTime';
import * as tooltip from 'utils/tooltip';
import CharLogEventMenu from './CharLogEventMenu';

const txtTampered = l10n.l('charLog.tamperedWith', "Event is likely tampered with.");

class CharLogEvent {
	constructor(modules, charId, ev, opt) {
		this.modules = modules;
		this.charId = charId;
		this.ev = ev;

		this._onMouseEnter = this._onMouseEnter.bind(this);
		this._onMouseLeave = this._onMouseLeave.bind(this);
		this._onClick = this._onClick.bind(this);

		// Prerender component
		let c = ev.component;
		if (!c) {
			let f = this.modules.self.getEventComponentFactory(ev.type);
			c = f ? f(charId, ev, opt) : new Txt(JSON.stringify(ev), { tagName: 'pre' });
		}
		let ec = ev.char;
		let invalid = ev.invalid;
		let mod = ev.mod;
		let div = document.createElement('div');
		let own = ec && ec.id == charId;
		div.className = 'ev-' + (ev.type || 'unknown');
		let subdiv = document.createElement('div');
		subdiv.className = 'charlog--ev'
			+ ((opt?.noFocus)
				? ' charlog--nofocus'
				: ec ? ' f-' + charId + '-' + ec.id : ''
			)
			+ (c.isCommunication && !(opt?.noMessageHighlight)
				? (own ? ' own' : '')
				+ (!own && (mod?.triggers?.length || mod?.mentioned) ? ' mentioned' : '')
				+ (ev.target?.id == charId || mod?.targeted ? ' targeted' : '')
				: ''
			)
			+ (invalid ? ' charlog--invalid' : '');
		div.appendChild(subdiv);
		c.render(subdiv);

		subdiv.addEventListener('mouseenter', this._onMouseEnter);
		subdiv.addEventListener('mouseleave', this._onMouseLeave);
		subdiv.addEventListener('click', this._onClick);

		this.subdiv = subdiv;
		this.c = c;
		this.div = div;
		this.noMenu = !!(ev.noMenu || c.noMenu || (opt && opt.noMenu));
	}

	render(el) {
		el.appendChild(this.div);
		return this.div;
	}

	unrender() {
		this.c.unrender();
		if (this.menu) {
			this.menu.unrender();
			this.menu = null;
		}
		this.div.parentElement.removeChild(this.div);
	}

	_getTooltipText() {
		let ev = this.ev;
		let ec = ev.char;
		let invalid = ev.invalid;
		let txt = "";
		if (ec) {
			let ep = ev.puppeteer;
			txt = (ec.name + " " + ec.surname).trim() + (ep ? "\n(" + (ep.name + " " + ep.surname).trim() + ")" : '') + (ev.time ? "\n" + formatDateTime(new Date(ev.time)) : '');
		} else if (ev.time) {
			txt = formatDateTime(new Date(ev.time));
		}
		if (invalid) {
			txt += "\n" + l10n.t(invalid.code, invalid.message, invalid.data) + "\n" + l10n.t(txtTampered);
		}
		return txt;
	}

	_onClick(ev) {
		let txt = this._getTooltipText();
		if (txt) {
			this.tooltip = tooltip.click(ev.currentTarget, txt, { className: 'charlog-event--tooltip', position: ev.clientX, margin: 'm', hoverDelay: true });
		}
		ev.stopPropagation();
	}

	_onMouseEnter(ev) {
		// let txt = this._getTooltipText();
		// if (txt) {
		// 	this.tooltip = tooltip.mouseEnter(ev.currentTarget, txt, { position: ev.clientX, margin: 'm', hoverDelay: true });
		// }
		if (!this.noMenu) {
			this._renderMenu();
		}
	}

	_onMouseLeave(ev) {
		// this.tooltip = tooltip.mouseLeave(ev.currentTarget);
		if (!this.noMenu) {
			this._unrenderMenu();
		}
	}

	_renderMenu() {
		if (!this.menu) {
			let menuItems = this.modules.self.getMenuItems()
				.toArray()
				.filter(m => m.filter ? m.filter(this.charId, this.ev) : true);
			if (menuItems.length) {
				this.menu = new CharLogEventMenu(this.modules, this.charId, this.ev, menuItems);
				this.menu.render(this.subdiv);
			}
		} else {
			this.menu.fadeIn();
		}
	}

	_unrenderMenu() {
		if (this.menu) {
			this.menu.fadeOut(() => this.menu = null);
		}
	}
}

export default CharLogEvent;
