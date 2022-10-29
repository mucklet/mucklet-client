import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import errString from 'utils/errString';
import './requestSetRoomOwner.scss';

/**
 * RequestSetRoomOwner adds the "setRoomOwner" request type.
 */
class RequestSetRoomOwner {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'pageRequests' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.pageRequests.addRequestType({
			id: 'setRoomOwner',
			titleFactory: r => l10n.l('requestSetRoomOwner.wantsToSetRoomOwner', "wants to give room ownership"),
			componentFactory: r => new Elem(n => n.elem('div', { className: 'requestsetroomowner' }, [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestSetRoomOwner.room', "Room"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.params.room, m => errString(m, m => m.name, l10n.l('requestSetRoomOwner.unknown', "(Unknown)")), {
						className: 'badge--info badge--strong'
					}))
				]),
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestSetRoomOwner.from', "From"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.params.owner, m => errString(m, m => (m.name + ' ' + m.surname).trim(), l10n.l('requestSetRoomOwner.unknown', "(Unknown)")), {
						className: 'badge--info badge--strong'
					}))
				]),
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestSetRoomOwner.to', "To"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.to, m => errString(m, m => (m.name + ' ' + m.surname).trim(), l10n.l('requestSetRoomOwner.unknown', "(Unknown)")), {
						className: 'badge--info badge--strong'
					}))
				])
			]))
		});
	}

	dispose() {
		this.requestTypes = null;
	}
}

export default RequestSetRoomOwner;
