import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';

/**
 * ReportCharProfile adds the report char profile tool to PageChar.
 */
class ReportCharProfile {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'pageChar',
			'player',
			'dialogReport',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Add logout tool
		this.module.pageChar.addTool({
			id: 'reportProfile',
			type: 'footer',
			sortOrder: 10,
			componentFactory: (ctrl, char) => new Elem(n => n.elem('button', {
				className: 'btn tiny tinyicon',
				events: {
					click: () => this.reportProfile(ctrl, char),
				},
			}, [
				n.component(new FAIcon('flag')),
				n.component(new Txt(l10n.l('reportCharProfile.report', "Report"))),
			])),
			filter: (ctrl, char) => !this.module.player.ownsChar(char.id),
		});

	}

	/**
	 * Reports a character profile for char, using your controlled character,
	 * ctrl, as reporter.
	 * @param {Model} ctrl Controlled character making the report.
	 * @param {Model} char Charater whose profile to report.
	 */
	reportProfile(ctrl, char) {
		this.module.api.get('core.char.' + char.id).catch((err) => {
			console.error("Error getting char: ", err);
			return char;
		}).then(c => {
			this.module.dialogReport.open(ctrl.id, c.id, c.puppeteer?.id, {
				attachProfile: true,
			});
		});
	}

	dispose() {
		this.module.pageChar.addTool('reportProfile');
	}
}

export default ReportCharProfile;
