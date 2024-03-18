import l10n from 'modapp-l10n';
import HelpAboutComponent from './HelpAboutComponent';
import './helpAbout.scss';

/**
 * HelpAbout adds the format help category and allows other modules to registers keyboard formats.
 */
class HelpAbout {

	constructor(app, params) {
		this.app = app;
		this.app.require([
			'help',
			'info',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.help.addCategory({
			id: 'about',
			title: l10n.l('help.aboutTitle', "About the realm"),
			shortDesc: l10n.l('help.aboutShortDesc', "Learn more about the realm"),
			desc: () => new HelpAboutComponent(this.module),
			sortOrder: 15,
			promoted: true,
		});
	}

	dispose() {
		this.module.help.removeCategory('format');
	}
}

export default HelpAbout;
