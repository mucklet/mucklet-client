
import { ModifyModel } from 'modapp-resource';

function getLocationObject(ctrl, area) {
	let l = getCurrentLocation(ctrl, area);
	return l && !area.children.props[l.id]
		? { [l.id]: l }
		: {};
}

function getCurrentLocation(ctrl, area) {
	let location = ctrl.inRoom;
	let locationArea = location.area;
	while (locationArea) {
		if (locationArea.id == area.id) {
			return location;
		}
		location = locationArea;
		locationArea = locationArea.parent;
	}
	return null;
}

/**
 * Creates a model of child items of an area, including any hidden area/room
 * that the character is currently in.
 */
class AreaChildrenModel extends ModifyModel {

	/**
	 * Creates a new AreaChildrenModel instance.
	 * @param {Model} ctrl Controlled character model.
	 * @param {Model} area Area model.
	 * @param {object} [opt] Optional parameters.
	 * @param {EventBus} [opt.eventBus] Event bus.
	 */
	constructor(ctrl, area, opt) {
		super(area.children, {
			props: getLocationObject(ctrl, area),
			isModifiedProperty: null,
			modifiedOnNew: true,
		}, opt);

		// Bind callbacks
		this._updateChildren = this._updateChildren.bind(this);

		this._ctrl = ctrl;
		this._area = area;
		this._listen(true);
	}

	_listen(on) {
		this._ctrl[on ? 'on' : 'off']('change', this._updateChildren);
		this._area.children[on ? 'on' : 'off']('change', this._updateChildren);
	}

	_updateChildren() {
		// Ensure we are not disposed
		if (!this._ctrl) {
			return;
		}
		// Old modifications (added private location) are cleared by default.
		let mods = this.getModifications() || {};
		for (let k in mods) {
			mods[k] = this._area.children[k];
		}

		this.set(Object.assign(mods, getLocationObject(this._ctrl, this._area)));
	}

	dispose() {
		if (this._ctrl) {
			this._listen(false);
			this._ctrl = null;
			this._area = null;
			super.dispose();
		}
	}
}

export default AreaChildrenModel;
