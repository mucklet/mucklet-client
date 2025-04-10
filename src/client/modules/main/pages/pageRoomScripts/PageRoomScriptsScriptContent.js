import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';

class PageRoomScriptsScriptContent {
	constructor(module, ctrl, room, script, toggle, close) {
		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.script = script;
		this.toggle = toggle;
		this.close = close;
	}

	render(el) {
		let editScript = new Elem(n => n.elem('div', { className: 'badge--select badge--select-margin' }, [
			n.elem('button', { className: 'iconbtn medium solid smallicon', events: {
				click: (c, ev) => {
					this.module.pageEditRoomScript.open(this.ctrl, this.room, this.script.id);
					ev.stopPropagation();
				},
			}}, [
				n.component(new FAIcon('pencil')),
			]),
		]));

		this.elem = new Elem(n => n.elem('div', [
			n.elem('div', { className: 'badge--select badge--margin badge--select-margin' }, [
				n.elem('button', { className: 'btn medium primary flex-1', events: {
					click: (el, e) => {
						this._activateScript();
						e.stopPropagation();
					},
				}}, [
					n.component(new FAIcon('power-off')),
					n.component(new Txt(l10n.l('pageRoomScripts.activate', "Activate"))),
				]),
				n.component(new ModelComponent(
					this.ctrl,
					new Collapser(null, { horizontal: true }),
					(m, c) => c.setComponent(m.puppeteer ? null : editScript),
				)),
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

	_activateScript() {
		console.error("not implemented");
	}

}

export default PageRoomScriptsScriptContent;
