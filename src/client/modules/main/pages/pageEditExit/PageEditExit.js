import { Model } from 'modapp-resource';
import PageEditExitComponent from './PageEditExitComponent';
import l10n from 'modapp-l10n';
import getRoomInstanceId from 'utils/getRoomInstanceId';
import './pageEditExit.scss';

/**
 * PageEditExit opens an in-panel edit room exit page in the room panel.
 */
class PageEditExit {
	constructor(app, params) {
		this.app = app;
		this.app.require([ 'api', 'roomPages', 'confirm', 'deleteExit' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}


	/**
	 * Opens an in-panel edit exit page in the room panel.
	 * @param {*} ctrl Controlled char model.
	 * @param {*} room Room model.
	 * @param {*} exit Exit model of the exit to edit.
	 * @returns {function} Close function.
	 */
	open(ctrl, room, exit) {

		let exitId = exit.id;
		// Lazyload hidden exits.
		let model = new Model({ data: { exit: null, error: null }, eventBus: this.app.eventBus });
		let open = true;
		let exitDetails = null;
		let closer = null;
		let onDelete = () => closer ? closer() : null;
		this.module.api.get('core.exit.' + exitId + '.details')
			.then(exit => {
				if (open) {
					exitDetails = exit;
					exit.on('delete', onDelete);
					model.set({ exit });
				}
			})
			.catch(error => {
				if (open) {
					model.set({ error });
				}
			});

		closer = this.module.roomPages.openRoomPage(
			'editExit_' + exitId,
			ctrl.id,
			getRoomInstanceId(room),
			(ctrl, room, state, close) => ({
				component: new PageEditExitComponent(this.module, ctrl, room, exitId, model, state, close),
				title: l10n.l('pageEditExit.editExit', "Edit Exit"),
			}),
			{
				onClose: () => {
					open = false;
					if (exitDetails) {
						exitDetails.off('delete', onDelete);
					}
				},
			},
		);
		return closer;
	}

	dispose() {}
}

export default PageEditExit;
