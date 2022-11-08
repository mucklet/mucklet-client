import { Elem } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';

class PageTeleportCharNode {
	constructor(module, ctrl, node, opt) {
		opt = opt || {};
		this.module = module;
		this.ctrl = ctrl;
		this.node = node;
		this.closePage = opt.closePage || null;
		this.isGlobal = !!opt.isGlobal;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pageteleportchar-node' }, [
			n.elem('btn', 'div', { className: 'badge btn', events: {
				click: () => this._teleport(),
			}}, [
				n.elem('div', { className: 'badge--select' }, [
					n.elem('div', { className: 'badge--info' }, [
						n.component(new ModelTxt(this.node.room, m => m.name, { tagName: 'div', className: this.isGlobal ? 'badge--strong' : 'badge--title' })),
						n.component(new ModelTxt(this.node, m => m.key, { tagName: 'div', className: 'badge--text' })),
					]),
					n.component(this._canEdit()
						? new Elem(n => n.elem('div', { className: 'badge--tools pageteleportchar-node--tools' }, [
							n.elem('button', { className: 'iconbtn medium tinyicon', events: {
								click: (c, ev) => {
									this._edit();
									ev.stopPropagation();
								},
							}}, [
								n.component(new FAIcon('pencil')),
							]),
						]))
						: null,
					),
				]),
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

	_canEdit() {
		return !this.isGlobal || this.module.player.isAdmin();
	}

	_teleport() {
		this.ctrl.call('teleport', { nodeId: this.node.id })
			.then(() => this.closePage && this.closePage());
	}

	_edit() {
		this.module.pageEditTeleport.open(this.ctrl, this.node, this.isGlobal);
	}
}

export default PageTeleportCharNode;
