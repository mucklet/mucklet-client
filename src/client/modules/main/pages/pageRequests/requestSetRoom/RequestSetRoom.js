import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import errString from 'utils/errString';
import './requestSetRoom.scss';

/**
 * RequestSetRoom adds the "setRoom" request type.
 */
class RequestSetRoom {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'pageRequests' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.pageRequests.addRequestType({
			id: 'setRoom',
			titleFactory: r => l10n.l('requestSetRoom.wantsToSetRoom', "wants to update room"),
			componentFactory: r => new Elem(n => n.elem('div', { className: 'requestsetroom' }, [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestSetRoom.room', "Room"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.params.room, m => errString(m, m => m.name, l10n.l('requestSetRoom.unknown', "(Unknown)")), {
						className: 'badge--info badge--strong',
					})),
				]),
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestSetRoom.area', "Area"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.params.area, m => errString(m, m => m.name, l10n.l('requestSetRoom.unknown', "(Unknown)")), {
						className: 'badge--info badge--strong',
					})),
				]),
			])),
		});
	}

	dispose() {
		this.requestTypes = null;
	}
}

export default RequestSetRoom;
