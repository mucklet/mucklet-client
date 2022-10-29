import l10n from 'modapp-l10n';
import HelpOverseerComponent from './HelpOverseerComponent';
import './helpOverseer.scss';

/**
 * HelpOverseer adds the overseer help category.
 */
class HelpOverseer {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.help.addCategory({
			id: 'overseer',
			title: l10n.l('help.overseerTitle', "Overseer commands"),
			shortDesc: l10n.l('help.overseerTitle', "Info about the overseer role"),
			desc: () => new HelpOverseerComponent(this.module),
			sortOrder: 1000
		});
	}

	addTopic(topic) {
		this.module.help.addTopic(Object.assign({ category: 'overseer' }, topic));
		return this;
	}

	dispose() {
		this.module.help.removeCategory('overseer');
	}
}

export default HelpOverseer;
