import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PageRoomScriptsScriptContent from './PageRoomScriptsScriptContent';

class PageRoomScriptsScript {
	constructor(module, ctrl, room, script, model, close) {
		this.ctrl = ctrl;
		this.room = room;
		this.script = script;
		this.module = module;
		this.model = model;
		this.close = close;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new Elem(n =>
				n.elem('div', { className: 'pageroomscripts-script' }, [
					n.elem('btn', 'div', { className: 'badge btn large', events: {
						click: () => this._toggleActions(),
					}}, [
						n.elem('div', { className: 'badge--select' }, [
							n.component(this.module.avatar.newRoomImg(this.script, { className: 'badge--icon' })),
							n.elem('div', { className: 'badge--info large' }, [
								n.elem('div', { className: 'pageroomscripts-script--title badge--title badge--nowrap' }, [
									n.component(new ModelTxt(this.script, p => p.keyword)),
								]),
								n.elem('div', { className: 'badge--strong badge--nowrap' }, [
									n.component(new ModelTxt(this.script, p => p.deactivated
										? l10n.l('pageRoomScripts.deactivated', "Deactivated")
										: l10n.l('pageRoomScripts.activated', "Activated"),
									)),
								]),
								n.elem('div', { className: 'badge--text badge--nowrap' }, [
									n.component(new ModelTxt(this.script, p => p.key)),
								]),
							]),
						]),
						n.component('actions', new Collapser(null)),
					]),
				]),
			),
			(m, c, change) => {
				if (change && !change.hasOwnProperty('scriptId')) return;

				c.getNode('actions').setComponent(m.scriptId === this.script.id
					? new PageRoomScriptsScriptContent(this.module, this.ctrl, this.room, this.script, (show) => this._toggleActions(show), this.close)
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
			? !this.model.scriptId || this.model.scriptId != this.script.id
			: !!show;

		this.model.set({ scriptId: show ? this.script.id : null });
	}

}

export default PageRoomScriptsScript;
