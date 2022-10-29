import l10n from 'modapp-l10n';
import HelpAdminComponent from './HelpAdminComponent';
import './helpAdmin.scss';

/**
 * HelpAdmin adds the admin help category.
 */
class HelpAdmin {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.help.addCategory({
			id: 'admin',
			title: l10n.l('help.adminTitle', "Administrator commands"),
			shortDesc: l10n.l('help.adminTitle', "Info about the administrator role"),
			desc: () => new HelpAdminComponent(this.module),
			sortOrder: 1100
		});
	}

	addTopic(topic) {
		this.module.help.addTopic(Object.assign({ category: 'admin' }, topic));
		return this;
	}

	dispose() {
		this.module.help.removeCategory('admin');
	}
}

export default HelpAdmin;
