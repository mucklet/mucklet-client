import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const txtWith = l10n.l('reportAttachmentCompare.with', "With");

let matchFlags = [
	{ key: 'userMatch', text: l10n.l('reportAttachmentCompare.samePlayer', "Same player.") },
	{ key: 'emailMatch', text: l10n.l('reportAttachmentCompare.sameEmail', "Same email address.") },
	{ key: 'ipMatch', text: l10n.l('reportAttachmentCompare.matchingIp', "Matching IP.") },
];
const txtNoMatch = l10n.l('compare.noPlayerMatch', "No player match.");

/**
 * ReportAttachmentCompare adds the compare action report attachment type.
 */
class ReportAttachmentCompare {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'pageReports',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.pageReports.addAttachmentType({
			id: 'compare',
			title: l10n.l('reportAttachmentCompare.cmp', "Cmp"),
			componentFactory: (info, reporter) => new Elem(n => {
				let c = info.char;
				let matches = [];
				for (let o of matchFlags) {
					if (info[o.key]) {
						if (matches.length) {
							matches.push(n.text(' '));
						}
						matches.push(n.component(new Txt(o.text)));
					}
				}
				if (!matches.length) {
					matches.push(n.component(new Txt(txtNoMatch)));
				}
				return n.elem('div', [
					n.elem('div', { className: 'flex-row' }, [
						n.component(new Txt(txtWith, { className: 'badge--iconcol badge--subtitle' })),
						n.component(new Txt((c.name + ' ' + c.surname).trim(), {
							className: 'badge--info badge--text' + (c.deleted ? ' badge--strikethrough' : ''),
						})),
					]),
					n.elem('div', { className: 'badge--text' }, matches),
				]);
			}),
		});
	}

	dispose() {
		this.module.pageReports.removeAttachmentType('compare');
	}
}

export default ReportAttachmentCompare;
