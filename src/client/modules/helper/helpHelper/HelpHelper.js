import l10n from 'modapp-l10n';
import HelpHelperComponent from './HelpHelperComponent';
import './helpHelper.scss';

/**
 * HelpHelper adds the helper help category.
 */
class HelpHelper {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.help.addCategory({
			id: 'helper',
			title: l10n.l('help.helperTitle', "Helper information"),
			shortDesc: l10n.l('help.helperShortDesc', "Info about the helper title"),
			desc: () => new HelpHelperComponent(this.module),
			sortOrder: 1010
		});
	}

	addTopic(topic) {
		this.module.help.addTopic(Object.assign({ category: 'helper' }, topic));
		return this;
	}

	dispose() {
		this.module.help.removeCategory('helper');
	}
}

export default HelpHelper;
