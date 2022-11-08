import { ModelComponent } from 'modapp-resource-component';
import Collapser from 'components/Collapser';

/**
 * MobileAreaBadge adds an area badge to pageRoom for mobile layout.
 */
class MobileAreaBadge {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'pageRoom',
			'pageArea',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageRoom.addTool({
			id: 'mobileAreaBadge',
			type: 'section',
			sortOrder: 30,
			componentFactory: (ctrl, room, layout) => new ModelComponent(
				room,
				new Collapser(),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('area')) {
						c.setComponent(m.area
							? this.module.pageArea.newBadge(ctrl, m.area)
							: null,
						);
					}
				},
			),
			filter: (ctrl, room, canEdit, canDelete, layoutId) => layoutId == 'mobile',
		});
	}

	dispose() {
		this.module.pageRoom.removeTool('mobileAreaBadge');
	}
}

export default MobileAreaBadge;
