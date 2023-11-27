import { ModelComponent, CollectionComponent } from 'modapp-resource-component';
import Fader from 'components/Fader';
import NavButtons from 'components/NavButtons';
import * as tooltip from 'utils/tooltip';

/**
 * OverlayNavButtons is the navigation component.
 */
class OverlayNavButtons {

	constructor(module, ctrl, opt) {
		this.module = module;
		this.ctrl = ctrl;
		this.opt = opt;

		this.fader = null;
		this.exits = {};

		// Bind callbacks
		this._update = this._update.bind(this);
		this._onClick = this._onClick.bind(this);
	}

	render(el) {

		this.fader = new Fader();
		this.exits = {};

		this.elem = new ModelComponent(
			this.module.charLog.getViewportModel(),
			new ModelComponent(
				this.ctrl,
				new CollectionComponent(
					null,
					this.fader,
					(col, c) => this._listenExits(col),
				),
				(m, c) => {
					c.setCollection(m.inRoom?.exits);
					this.tooltip?.close();
				},
			),
			(m, c) => this._updateTooltip(),
		);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.fader = null;
			this._listenExits();
			this.exits = null;
		}
	}

	_listenExits(col) {
		if (!this.exits) {
			return;
		}

		let update = false;
		let toDelete = Object.assign({}, this.exits);

		if (col) {
			for (let exit of col) {
				let id = exit.id;
				if (id) {
					if (toDelete[id]) {
						delete toDelete[id];
					} else {
						exit.on('change', this._update);
						this.exits[id] = exit;
						update = true;
					}
				}
			}
		}

		for (let id in toDelete) {
			this.exits[id].off('change', this._update);
			delete this.exits[id];
			update = true;
		}

		// Call _update on any change.
		if (update) {
			this._update();
		}
	}

	_update() {
		if (!this.fader) {
			return;
		}

		let exits = this.ctrl.inRoom?.exits || [];
		let state = {};

		for (let exit of exits) {
			if (exit.nav && !state[exit.nav]) {
				state[exit.nav] = { icon: exit.icon || '', title: exit.name };
			}
		}
		if (exits.length) {
			state['c'] = { count: exits.length };
		}

		if (Object.keys(state).length) {
			this.fader.setComponent(
				this.fader.getComponent()?.setState(state) ||
				new NavButtons(state, {
					shadow: true,
					center: true,
					onClick: this._onClick,
					className: 'overlaynav-buttons',
				}),
			);
		} else {
			// Hide nav buttons if no direction is set.
			this.fader.setComponent(null);
		}
	}

	_onClick(dir) {
		if (dir == 'c') {
			this._openExitsTooltip();
			return;
		}

		let exits = this.ctrl.inRoom?.exits || [];
		for (let exit of exits) {
			if (exit.nav == dir) {
				return this.ctrl.call('useExit', { exitId: exit.id })
					.catch(err => this.module.toaster.openError(err));
			}
		}
	}

	_openExitsTooltip() {
		let el = this.fader?.getComponent()?.getElement();
		if (!el) {
			return;
		}

		let exits = this.ctrl.inRoom?.exits;
		if (exits) {
			this.tooltip = tooltip.click(
				el,
				this.module.pageRoom.newRoomExits(this.ctrl, exits, {
					className: 'overlaynav-buttons--tooltip-hidescroll',
				}),
				{
					className: 'overlaynav-buttons--tooltip',
					position: 'bottom',
					padding: 'none',
					size: 'auto',
					hoverDelay: true,
					onClose: () => {
						this.tooltip = null;
					},
				},
			);
			this._updateTooltip();
		}
	}

	_updateTooltip() {
		let elem = this.tooltip?.getComponent();
		let el = elem?.getElement();
		if (!elem || !el) {
			return;
		}

		let m = this.module.charLog.getViewportModel();
		let rect = el.getBoundingClientRect();
		elem.setStyle('max-height', (m.height - rect.top - 4 + m.y) + 'px');
	}
}

export default OverlayNavButtons;
