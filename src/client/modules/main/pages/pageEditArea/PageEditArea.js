import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import PageEditAreaComponent from './PageEditAreaComponent';
import './pageEditArea.scss';

/**
 * PageEditArea opens an in-panel edit room page in the room panel.
 */
class PageEditArea {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'api',
			'roomPages',
			'pageArea',
			'confirm',
			'dialogSetAreaOwner',
			'player',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageArea.addTool({
			id: 'editArea',
			sortOrder: 10,
			componentFactory: (ctrl, area) => new Elem(n => n.elem('button', { className: 'iconbtn small', events: {
				click: () => this.open(ctrl, area),
			}}, [
				n.component(new FAIcon('pencil')),
			])),
			filter: (ctrl, area, canEdit) => canEdit,
		});
	}

	/**
	 * Opens an in-panel edit room page in the room panel.
	 * @param {*} ctrl Controlled char model.
	 * @param {*} area Area model of the area to edit.
	 * @param {bool} toggleOpen Flag if the room panel should be toggled open.
	 * @returns {Promise.<function>} Promise of a close function.
	 */
	open(ctrl, area, toggleOpen) {
		return this.module.api.get('core.area.' + area.id + '.settings').then(areaSettings => {
			areaSettings.on();
			let close = this.module.roomPages.openPage(
				'editArea_' + area.id,
				ctrl.id,
				null,
				(ctrl, room, state, close) => ({
					component: new PageEditAreaComponent(this.module, ctrl, area, areaSettings, state, close),
					title: l10n.l('pageEditArea.editArea', "Edit Area"),
				}),
				{
					onClose: () => {
						areaSettings.off();
					},
					openPanel: toggleOpen,
				},
			);
			return close;
		});
	}

	dispose() {
		this.module.pageArea.removeTool('editArea');
	}
}

export default PageEditArea;
