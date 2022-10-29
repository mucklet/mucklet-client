import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import errString from 'utils/errString';
import './requestSetAreaOwner.scss';

/**
 * RequestSetAreaOwner adds the "setAreaOwner" request type.
 */
class RequestSetAreaOwner {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'pageRequests' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.pageRequests.addRequestType({
			id: 'setAreaOwner',
			titleFactory: r => l10n.l('requestSetAreaOwner.wantsToSetAreaOwner', "wants to give area ownership"),
			componentFactory: r => new Elem(n => n.elem('div', { className: 'requestsetareaowner' }, [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestSetAreaOwner.area', "Area"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.params.area, m => errString(m, m => m.name, l10n.l('requestSetAreaOwner.unknown', "(Unknown)")), {
						className: 'badge--info badge--strong'
					}))
				]),
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestSetAreaOwner.from', "From"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.params.owner, m => errString(m, m => (m.name + ' ' + m.surname).trim(), l10n.l('requestSetAreaOwner.unknown', "(Unknown)")), {
						className: 'badge--info badge--strong'
					}))
				]),
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestSetAreaOwner.to', "To"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.to, m => errString(m, m => (m.name + ' ' + m.surname).trim(), l10n.l('requestSetAreaOwner.unknown', "(Unknown)")), {
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

export default RequestSetAreaOwner;
