import { Context } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import { Model, ModelToCollection } from 'modapp-resource';
import PanelSection from 'components/PanelSection';
import ModelCollapser from 'components/ModelCollapser';
import l10n from 'modapp-l10n';
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
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageRoom.addTool({
			id: 'commands',
			type: 'section',
			sortOrder: 20,
			componentFactory: (ctrl, room, state, roomState) => new ModelCollapser(room.cmds, [{
				condition: (cmds) => Object.keys(cmds.props).length,
				factory: (cmds) => {
					let model = new Model({ data: { selected: roomState.selected || null }});
					return new PanelSection(
						l10n.l('pageRoom.commands', "Commands"),
						new Context(
							() => new ModelToCollection(cmds, {
								compare: (a, b) => {
									let av = a.value;
									let bv = b.value;
									return (av.priority - bv.priority) || av.id.localeCompare(bv.id);
								},
								eventBus: this.app.eventBus,
							}),
							(col) => col.dispose(),
							(col) => new CollectionList(
								col,
								m => new PageRoomCommandsCmd(this.module, m, model, (selected) => {
									model.set({ selected });
									roomState.selected = selected;
								}),
							),
						),
						{
							className: 'common--sectionpadding',
							open: state.open,
							onToggle: (c, v) => state.open = v,
						},
					);
				},
			}]),
		});
	}

	dispose() {
		this.module.pageRoom.removeTool('commands');
	}
}

export default PageRoomDesc;
