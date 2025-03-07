import CmdPatternStep from './CmdPatternStep';

/**
 * CmdPattern registers command handler to the Cmd module to handle custom
 * command patterns beloning to scripts.
 */
class CmdPattern {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.fieldTypes = {};
		this.module.cmd.addCmdHandler({
			id: 'cmdPattern',
			factory: (elseStep) => new CmdPatternStep(this.module, () => this._getPatterns(), { else: elseStep }),
			complete: (step, doc, pos, state) => step.complete(doc, pos, state),
			sortOrder: 10,
		});
	}


	/**
	 * Adds a custom command field type.
	 * @param {import('types/modules/cmdPattern').FieldType} fieldType Field type object.
	 * @returns {this}
	 */
	addFieldType(fieldType) {
		if (this.fieldTypes[fieldType.id]) {
			throw new Error("FieldType ID already registered: ", fieldType.id);
		}
		this.fieldTypes[fieldType.id] = fieldType;
		return this;
	}

	/**
	 * Removes a custom command field type registered with addFieldType.
	 * @param {string} fieldTypeId ID of field type.
	 */
	removeFieldType(fieldTypeId) {
		delete this.fieldTypes[fieldTypeId];
		return this;
	}

	/**
	 * Gets a registred field type.
	 * @param {string} fieldTypeId ID of field type.
	 * @returns {import('types/modules/cmdPattern').FieldType | undefined} Registered field type of undefined if not found.
	 */
	getFieldType(fieldTypeId) {
		return this.fieldTypes[fieldTypeId];
	}

	_getPatterns() {
		let props = this.module.player.getActiveChar()?.inRoom?.cmds?.props;
		if (!props) {
			return null;
		}

		return Object.keys(props)
			.map(key => props[key])
			.filter(o => o.cmd)
			.sort((a, b) => b.priority - a.priority);
	}

	dispose() {
		this.module.cmd.removeCmdHandler('cmdPattern');
	}
}

export default CmdPattern;
