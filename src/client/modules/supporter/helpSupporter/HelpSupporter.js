import l10n from 'modapp-l10n';
import HelpSupporterComponent from './HelpSupporterComponent';
import './helpSupporter.scss';

/**
 * HelpSupporter adds the supporter help category.
 */
class HelpSupporter {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.help.addCategory({
			id: 'supporter',
			title: l10n.l('help.supporterTitle', "Supporter information"),
			shortDesc: l10n.l('help.supporterShortDesc', "Info about the supporter title"),
			desc: () => new HelpSupporterComponent(this.module),
			sortOrder: 1010,
		});
	}

	addTopic(topic) {
		this.module.help.addTopic(Object.assign({ category: 'supporter' }, topic));
		return this;
	}

	dispose() {
		this.module.help.removeCategory('supporter');
	}
}

export default HelpSupporter;
