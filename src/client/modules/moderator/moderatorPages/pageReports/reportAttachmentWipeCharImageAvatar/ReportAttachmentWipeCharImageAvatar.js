import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';

const txtType = l10n.l('reportAttachmentWipeCharImageAvatar.type', "Type");
const txtWipeCharImage = l10n.l('reportAttachmentWipeCharImageAvatar.wipeImage', "Wipe image");
const txtWipeCharAvatar = l10n.l('reportAttachmentWipeCharImageAvatar.wipeAvatar', "Wipe avatar");

function fromTxt(inUse, inProfile) {
	return inUse
		? inProfile
			? l10n.l('reportAttachmentWipeCharImageAvatar.currentAndStoredProfile', "Found in current and stored profile.")
			: l10n.l('reportAttachmentWipeCharImageAvatar.currentProfile', "Found in current profile.")
		: inProfile
			? l10n.l('reportAttachmentWipeCharImageAvatar.storedProfile', "Found in stored profile.")
			: l10n.l('reportAttachmentWipeCharImageAvatar.notFoundInProfile', "Wiped but not found in profile.");
}

/**
 * ReportAttachmentWipeCharImageAvatar adds the wipeCharImage and wipeCharAvatar
 * action report attachment type.
 */
class ReportAttachmentWipeCharImageAvatar {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'pageReports',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Register wipeCharImage
		this.module.pageReports.addAttachmentType({
			id: 'wipeCharImage',
			componentFactory: (info, reporter) => this._factory(info, reporter, false),
		});

		this.module.pageReports.addAttachmentType({
			id: 'wipeCharAvatar',
			componentFactory: (info, reporter) => this._factory(info, reporter, true),
		});
	}

	_factory(info, reporter, isAvatar) {
		return new Elem(n => n.elem('div', [
			n.elem('div', { className: 'flex-row' }, [
				n.component(new Txt(txtType, { className: 'badge--iconcol badge--subtitle' })),
				n.component(new Txt(isAvatar ? txtWipeCharAvatar : txtWipeCharImage, { className: 'badge--info badge--text' })),
			]),
			n.elem('div', { className: 'badge--text' }, [
				n.component(new ModelTxt(info, m => fromTxt(m.inUse, m.inProfile), { className: 'common--formattext' })),
			]),
		]));
	}

	dispose() {
		this.module.pageReports.removeAttachmentType('wipeCharImage');
		this.module.pageReports.removeAttachmentType('wipeCharAvatar');
	}
}

export default ReportAttachmentWipeCharImageAvatar;
