import l10n from 'modapp-l10n';
import HelpFilterComponent from './HelpFilterComponent';
import './helpFilter.scss';

/**
 * HelpFilter adds the filter help category and allows other modules to registers keyboard filters.
 */
class HelpFilter {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.help.addCategory({
			id: 'filter',
			title: l10n.l('help.filterTitle', "Character filtering syntax"),
			shortDesc: l10n.l('help.filterSortDesc', "How to write character search filters"),
			desc: () => new HelpFilterComponent(this.module),
			sortOrder: 38,
		});
	}

	dispose() {
		this.module.help.removeCategory('filter');
	}
}

export default HelpFilter;
