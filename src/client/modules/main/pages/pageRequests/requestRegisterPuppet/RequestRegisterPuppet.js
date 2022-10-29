import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import errString from 'utils/errString';
import './requestRegisterPuppet.scss';

/**
 * RequestRegisterPuppet adds the "registerPuppet" request type.
 */
class RequestRegisterPuppet {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'pageRequests' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.pageRequests.addRequestType({
			id: 'registerPuppet',
			titleFactory: r => l10n.l('requestRegisterPuppet.wantsToRegisterPuppet', "wants to register puppet"),
			componentFactory: r => new Elem(n => n.elem('div', { className: 'requestregisterpuppet' }, [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestRegisterPuppet.who', "Who"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.params.puppet, m => errString(m, m => (m.name + ' ' + m.surname).trim(), l10n.l('requestRegisterPuppet.unknown', "(Unknown)")), {
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

export default RequestRegisterPuppet;
