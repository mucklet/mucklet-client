import { Txt } from 'modapp-base-component';
import formatDateTime from 'utils/formatDateTime';
import CharLogEventMenu from './CharLogEventMenu';

class CharLogEvent {
	constructor(modules, charId, ev, opt) {
		this.modules = modules;
		this.charId = charId;
		this.ev = ev;

		// Prerender component
		let c = ev.component;
		if (!c) {
			let f = this.modules.self.getEventComponentFactory(ev.type);
			c = f ? f(charId, ev, opt) : new Txt(JSON.stringify(ev), { tagName: 'pre' });
		}
		let ec = ev.char;
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
			);
		if (ec) {
			let ep = ev.puppeteer;
			subdiv.setAttribute('title', (ec.name + " " + ec.surname).trim() + (ep ? "\n(" + (ep.name + " " + ep.surname).trim() + ")" : '') + (ev.time ? "\n" + formatDateTime(new Date(ev.time)) : ''));
		} else if (ev.time) {
			subdiv.setAttribute('title', formatDateTime(new Date(ev.time)));
		}
		div.appendChild(subdiv);
		c.render(subdiv);

		if (!c.noMenu && (!opt || !opt.noMenu)) {
			div.addEventListener('mouseenter', () => this._renderMenu());
			div.addEventListener('mouseleave', () => this._unrenderMenu());
		}

		this.subdiv = subdiv;
		this.c = c;
		this.div = div;
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
