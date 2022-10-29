import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import errString from 'utils/errString';
import './requestSetArea.scss';

/**
 * RequestSetArea adds the "setArea" request type.
 */
class RequestSetArea {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'pageRequests' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.module.pageRequests.addRequestType({
			id: 'setArea',
			titleFactory: r => l10n.l('requestSetArea.wantsToSetArea', "wants to update area"),
			componentFactory: r => new Elem(n => n.elem('div', { className: 'requestsetarea' }, [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestSetArea.area', "Area"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.params.area, m => errString(m, m => m.name, l10n.l('requestSetArea.unknown', "(Unknown)")), {
						className: 'badge--info badge--strong'
					}))
				]),
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('requestSetArea.from', "Parent"), { className: 'badge--iconcol badge--subtitle' })),
					n.component(new ModelTxt(r.params.parent, m => errString(m, m => m.name, l10n.l('requestSetArea.unknown', "(Unknown)")), {
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

export default RequestSetArea;
