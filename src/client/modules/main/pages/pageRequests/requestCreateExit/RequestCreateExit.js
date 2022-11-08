import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import errString from 'utils/errString';
import './requestCreateExit.scss';

/**
 * RequestCreateExit adds the "createExit" request type.
 */
class RequestCreateExit {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'pageRequests' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.pageRequests.addRequestType({
			id: 'createExit',
			titleFactory: r => l10n.l('requestCreateExit.wantsToCreateExit', "wants to create an exit"),
			componentFactory: r => new Elem(n => n.elem('div', { className: 'requestcreateexit' }, [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestCreateExit.from', "From"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.params.room, m => errString(m, m => m.name, l10n.l('requestCreateExit.unknown', "(Unknown)")), { className: 'badge--info badge--strong' })),
				]),
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestCreateExit.to', "To"), { className: 'badge--iconcol badge--subtitle' })),
					n.elem('div', { className: 'badge--info' }, [
						n.component(new ModelTxt(r.params.targetRoom, m => errString(m, m => m.name, l10n.l('requestCreateExit.unknown', "(Unknown)")), { tagName: 'div', className: 'badge--strong' })),
						n.component(new ModelTxt(
							r.to,
							m => l10n.l('requestCreateExit.ownedBy', "owned by {fullname}.", { fullname: errString(m, m => (m.name + ' ' + m.surname), l10n.l('requestCreateExit.unknown', "unknown")).trim() }),
							{ tagName: 'div', className: 'badge--text' },
						)),
					]),
				]),
			])),
		});
	}

	dispose() {
		this.requestTypes = null;
	}
}

export default RequestCreateExit;
