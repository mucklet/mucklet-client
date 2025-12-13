import l10n from 'modapp-l10n';
import HelpFormatComponent from './HelpFormatComponent';
import HelpFormatInfoComponent from './HelpFormatInfoComponent';
import './helpFormat.scss';

/**
 * HelpFormat adds the format help category and allows other modules to registers keyboard formats.
 */
class HelpFormat {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.help.addCategory({
			id: 'format',
			title: l10n.l('help.formatTitle', "Text formatting"),
			shortDesc: l10n.l('help.formatShortDesc', "How to format communication and description texts"),
			desc: () => new HelpFormatComponent(this.module),
			sortOrder: 35,
		});

		this.module.help.addCategory({
			id: 'format info',
			title: l10n.l('help.infoFormatTitle', "Info field formatting"),
			shortDesc: l10n.l('help.infoFormatShortDesc', "How to format info fields like descriptions, about sections, and rules"),
			desc: () => new HelpFormatInfoComponent(this.module),
			sortOrder: 36,
		});
	}

	dispose() {
		this.module.help.removeCategory('format');
	}
}

export default HelpFormat;
