import l10n from 'modapp-l10n';
import HelpPioneerComponent from './HelpPioneerComponent';
import './helpPioneer.scss';

/**
 * HelpPioneer adds the pioneer help category.
 */
class HelpPioneer {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.help.addCategory({
			id: 'pioneer',
			title: l10n.l('help.pioneerTitle', "Pioneer information"),
			shortDesc: l10n.l('help.pioneerShortDesc', "Info about the pioneer title"),
			desc: () => new HelpPioneerComponent(this.module),
			sortOrder: 1010
		});
	}

	addTopic(topic) {
		this.module.help.addTopic(Object.assign({ category: 'pioneer' }, topic));
		return this;
	}

	dispose() {
		this.module.help.removeCategory('pioneer');
	}
}

export default HelpPioneer;
