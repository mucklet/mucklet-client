import l10n from 'modapp-l10n';
import HelpModerateComponent from './HelpModerateComponent';
import './helpModerate.scss';

/**
 * HelpModerate adds the moderate help category.
 */
class HelpModerate {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.help.addCategory({
			id: 'moderate',
			title: l10n.l('help.moderateTitle', "Moderator guidelines"),
			shortDesc: l10n.l('help.moderateTitle', "Info about the moderator role"),
			desc: () => new HelpModerateComponent(this.module),
			sortOrder: 1300
		});
	}

	addTopic(topic) {
		this.module.help.addTopic(Object.assign({ category: 'moderate' }, topic));
		return this;
	}

	dispose() {
		this.module.help.removeCategory('moderate');
	}
}

export default HelpModerate;
