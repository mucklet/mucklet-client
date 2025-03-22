import { ModelComponent } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import FormatTxt from 'components/FormatTxt';
import l10n from 'modapp-l10n';

const notSet = l10n.l('pageRoom.notSet', "Not set");

/**
 * PageRoomDesc adds the Description section to pageRoom.
 */
class PageRoomDesc {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'pageRoom',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageRoom.addTool({
			id: 'description',
			type: 'section',
			sortOrder: 10,
			componentFactory: (ctrl, room, state, roomState) => new PanelSection(
				l10n.l('pageRoom.description', "Description"),
				new ModelComponent(
					room,
					new FormatTxt("", { className: 'common--desc-size', state: roomState }),
					(m, c) => {
						c.setFormatText(m.desc ? m.desc : notSet);
						c[m.desc ? 'removeClass' : 'addClass']('pagechar--notset');
					},
				),
				{
					className: 'common--sectionpadding',
					open: state.descriptionOpen,
					onToggle: (c, v) => state.descriptionOpen = v,
				},
			),
		});
	}

	dispose() {
		this.module.pageRoom.removeTool('description');
	}
}

export default PageRoomDesc;
