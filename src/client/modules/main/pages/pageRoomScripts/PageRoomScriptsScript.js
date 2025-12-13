import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import formatDateTime from 'utils/formatDateTime';
import FAIcon from 'components/FAIcon';

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
			this.script,
			new Elem(n => n.elem('div', { className: 'pageroomscripts-script' }, [
				n.elem('btn', 'div', {
					className: 'badge btn',
					events: {
						click: (c, ev) => {
							this.module.pageEditRoomScript.open(this.ctrl, this.room, this.script.id);
							ev.stopPropagation();
						},
					},
				}, [
					n.elem('div', { className: 'badge--select' }, [
						n.elem('div', { className: 'badge--info' }, [
							n.component(new ModelTxt(this.script, m => m.key, { tagName: 'div', className: 'badge--title pageroomscripts-script--title' })),
							n.component(new ModelTxt(
								this.script,
								m => m.updated == m.created
									? l10n.l('pageCharProfile.created', "Created {created}", { created: formatDateTime(new Date(m.created)) })
									: l10n.l('pageCharProfile.updated', "Updated {updated}", { updated: formatDateTime(new Date(m.updated)) }),
								{ tagName: 'div', className: 'badge--text' },
							)),
						]),
						n.elem('div', { className: 'badge--tools' }, [
							n.elem('activate', 'button', { className: 'iconbtn medium tinyicon', events: {
								click: (c, ev) => {
									this._toggleActive();
									ev.stopPropagation();
								},
							}}, [
								n.component(new FAIcon('power-off')),
							]),
						]),
					]),
				]),
			])),
			(m, c) => {
				c[m.active ? 'removeNodeClass' : 'addNodeClass']('btn', 'inactive');
				c[m.active ? 'addNodeClass' : 'removeNodeClass']('activate', 'primary');
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

	_toggleActive() {
		this.ctrl.call('setRoomScript', {
			scriptId: this.script.id,
			active: !this.script.active,
		}).catch(err => this.module.toaster.openError(err));
	}

}

export default PageRoomScriptsScript;
