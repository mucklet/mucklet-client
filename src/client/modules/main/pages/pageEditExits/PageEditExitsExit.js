import { Elem } from 'modapp-base-component';
import { ModelTxt, CollectionComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';

class PageEditExitsExit {
	constructor(module, ctrl, room, exit, opt) {
		opt = opt || {};
		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.exit = exit;
		this.hidden = opt.hidden;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pageeditexits-exit' }, [
			n.elem('btn', 'div', { className: 'badge' }, [
				n.elem('div', { className: 'badge--select' }, [
					n.component(this.hidden ? null : new Elem(n => n.elem('div', { className: 'orderbtn' }, [
						n.component(new CollectionComponent(
							this.room.exits,
							new Elem(n => n.elem('button', {
								className: 'iconbtn medium order',
								events: { click: (c, e) => {
									this._move(-1);
									e.stopPropagation();
								} },
							}, [
								n.component(new FAIcon('caret-up')),
							])),
							(col, c) => c.setProperty('disabled', col.atIndex(0) == this.exit ? 'disabled' : null),
						)),
						n.component(new CollectionComponent(
							this.room.exits,
							new Elem(n => n.elem('button', {
								className: 'iconbtn medium order',
								events: { click: (c, e) => {
									this._move(1);
									e.stopPropagation();
								} },
							}, [
								n.component(new FAIcon('caret-down')),
							])),
							(col, c) => c.setProperty('disabled', col.atIndex(col.length - 1) == this.exit ? 'disabled' : null),
						)),
					]))),
					n.elem('div', { className: 'badge--info' }, [
						n.component(new ModelTxt(this.exit, m => m.name, { tagName: 'div', className: 'badge--title' })),
						n.component(new ModelTxt(this.exit, m => m.keys.join(", "), { tagName: 'div', className: 'badge--text' })),
					]),
					n.elem('div', { className: 'badge--tools' }, [
						n.elem('button', { className: 'iconbtn medium tinyicon', events: {
							click: (c, ev) => {
								this._edit();
								ev.stopPropagation();
							},
						}}, [
							n.component(new FAIcon('pencil')),
						]),
					]),
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

	_edit() {
		this.module.pageEditExit.open(this.ctrl, this.room, this.exit);
	}

	_move(dir) {
		let idx = this.room.exits.toArray().indexOf(this.exit);

		if (idx < 0) return;
		idx += dir;

		if (idx < 0 || idx >= this.room.exits.length) return;

		this.ctrl.call('setExitOrder', { exitId: this.exit.id, order: idx })
			.catch(err => this.module.toaster.openError(err));
	}

}

export default PageEditExitsExit;
