import l10n from 'modapp-l10n';
import HelpRulesComponent from './HelpRulesComponent';
import './helpRules.scss';

/**
 * HelpRules adds the format help category and allows other modules to registers keyboard formats.
 */
class HelpRules {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.help.addCategory({
			id: 'rules',
			title: l10n.l('help.rulesTitle', "Realm rules and etiquette"),
			shortDesc: l10n.l('help.rulesShortDesc', "Learn about realm rules and etiquette"),
			desc: () => new HelpRulesComponent(this.module),
			sortOrder: 5
		});
	}

	addTopic(topic) {
		this.module.help.addTopic(Object.assign({ category: 'rules' }, topic));
		return this;
	}

	dispose() {
		this.module.help.removeCategory('format');
	}
}

export default HelpRules;
