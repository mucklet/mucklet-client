import l10n from 'modapp-l10n';
import HelpFormatComponent from './HelpFormatComponent';
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
			shortDesc: l10n.l('help.formatSortDesc', "How to format communication and description texts"),
			desc: () => new HelpFormatComponent(this.module),
			sortOrder: 85,
		});
	}

	dispose() {
		this.module.help.removeCategory('format');
	}
}

export default HelpFormat;
