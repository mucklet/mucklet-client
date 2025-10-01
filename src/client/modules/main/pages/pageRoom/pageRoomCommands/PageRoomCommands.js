import { Context } from 'modapp-base-component';
import { CollectionList, CollectionComponent } from 'modapp-resource-component';
import { Model, ModelToCollection } from 'modapp-resource';
import PanelSection from 'components/PanelSection';
import Collapser from 'components/Collapser';
import l10n from 'modapp-l10n';
import cmdCompare from 'utils/cmdCompare';
import PageRoomCommandsCmd from './PageRoomCommandsCmd';
import './pageRoomCommands.scss';


/**
 * PageRoomDesc adds the Description section to pageRoom.
 */
class PageRoomDesc {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'pageRoom',
			'cmdPattern',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageRoom.addTool({
			id: 'commands',
			type: 'section',
			sortOrder: 20,
			componentFactory: (ctrl, room, state, roomState) => new Context(
				() => new ModelToCollection(room.cmds, {
					compare: (a, b) => cmdCompare(a.value, b.value),
					filter: (k, v) => v.id && !v.unlisted && (!v.restricted || this.module.player.canEdit(room.owner?.v)),
					eventBus: this.app.eventBus,
				}),
				(col) => col.dispose(),
				(col) => new CollectionComponent(
					col,
					new Collapser(),
					(col, c) => c.setComponent(col.length
						? c.getComponent() || this._newCommandsPanel(col, state, roomState)
						: null,
					),
				),
			),
		});
	}

	/**
	 * Creates a new PanelSection listing commands.
	 * @param {ModelToCollection} cmds Collection of command models.
	 * @param {object} state State object.
	 * @param {object} roomState Room state object.
	 * @returns {PanelSection} Panel section component.
	 */
	_newCommandsPanel(cmds, state, roomState) {
		let model = new Model({ data: { selected: roomState.selected || null }});
		return new PanelSection(
			l10n.l('pageRoom.commands', "Commands"),
			new CollectionList(
				cmds,
				m => new PageRoomCommandsCmd(this.module, m, model, (selected) => {
					model.set({ selected });
					roomState.selected = selected;
				}),
			),
			{
				className: 'common--sectionpadding',
				open: state.open,
				onToggle: (c, v) => state.open = v,
			},
		);
	}

	dispose() {
		this.module.pageRoom.removeTool('commands');
	}
}

export default PageRoomDesc;
