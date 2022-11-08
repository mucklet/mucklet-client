import { Elem } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import PageEditExitsComponent from './PageEditExitsComponent';
import './pageEditExits.scss';

/**
 * PageEditRoom opens an in-panel edit exits page in the room panel.
 */
class PageEditRoom {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'roomPages',
			'pageRoom',
			'confirm',
			'player',
			'pageEditExit',
			'dialogCreateExit',
			'toaster',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageRoom.addTool({
			id: 'editExits',
			type: 'exit',
			sortOrder: 10,
			componentFactory: (ctrl, room) => new Elem(n => n.elem('button', { className: 'iconbtn tiny', events: {
				click: (c, e) => {
					this.open(ctrl, room);
					e.stopPropagation();
				},
			}}, [
				n.component(new FAIcon('pencil')),
			])),
			filter: (ctrl, room, canEdit, canDelete) => canEdit,
		});
	}

	/**
	 * Opens an in-panel edit exits page in the room panel.
	 * @param {*} ctrl Controlled char model.
	 * @param {*} room Room model of the room to edit the exits for.
	 * @returns {function} Close function.
	 */
	open(ctrl, room) {
		// Lazyload hidden exits.
		let model = new Model({ data: { hiddenExits: null, error: null }, eventBus: this.app.eventBus });
		let open = true;
		this.module.api.get('core.room.' + room.id + '.exits.hidden')
			.then(hiddenExits => {
				if (open) {
					hiddenExits.on();
					model.set({ hiddenExits });
				}
			})
			.catch(error => {
				if (open) {
					model.set({ error });
				}
			});

		return this.module.roomPages.openPage(
			'editExits',
			ctrl.id,
			room.id,
			(ctrl, room, state, close) => ({
				component: new PageEditExitsComponent(this.module, ctrl, room, model, state, close),
				title: l10n.l('pageEditExits.editExits', "Edit Exits"),
			}),
			{
				onClose: () => {
					open = false;
					if (model.hiddenExits) {
						model.hiddenExits.off();
					}
				},
			},
		);
	}

	dispose() {}
}

export default PageEditRoom;
