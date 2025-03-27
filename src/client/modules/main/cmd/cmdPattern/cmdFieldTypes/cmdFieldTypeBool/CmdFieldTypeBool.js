import { matchFactory, completeFactory } from 'utils/cmdFieldType';

/**
 * CmdFieldTypeBool registers the "bool" field type for custom commands.
 */
class CmdFieldTypeBool {
	constructor(app) {
		this.app = app;

		// Bind callbacks
		this._getList = this._getList.bind(this);

		this.app.require([
			'cmdPattern',
			'cmdLists',
		], this._init.bind(this));
	}

	_init(module) {
		/**
		 * @type {{
		 * 	cmdPattern: import('modules/main/cmd/cmdPattern/CmdPattern').default,
		* 	cmdLists: import('modules/main/cmd/cmdLists/CmdLists').default,
		 * }}
		 */
		this.module = module;
		this.module.cmdPattern.addFieldType({
			id: 'bool',
			match: matchFactory(this._getList, (item, match) => ({ value: item ? item.value : false })),
			complete: completeFactory(this._getList),
		});
	}

	_getList(ctx, opts) {
		return this.module.cmdLists.getBool();
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('bool');
	}
}

export default CmdFieldTypeBool;
