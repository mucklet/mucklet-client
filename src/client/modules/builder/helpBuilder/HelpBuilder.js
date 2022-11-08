import l10n from 'modapp-l10n';
import HelpBuilderComponent from './HelpBuilderComponent';
import './helpBuilder.scss';

/**
 * HelpBuilder adds the builder help category.
 */
class HelpBuilder {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.help.addCategory({
			id: 'builder',
			title: l10n.l('helpBuilder.title', "Builder info"),
			shortDesc: l10n.l('helpBuilder.shortDesc', "Info about the builder role"),
			desc: () => new HelpBuilderComponent(this.module),
			sortOrder: 1200,
		});
	}

	addTopic(topic) {
		this.module.help.addTopic(Object.assign({ category: 'builder' }, topic));
		return this;
	}

	dispose() {
		this.module.help.removeCategory('builder');
	}
}

export default HelpBuilder;
