import CmdPatternStep from './CmdPatternStep';
import CmdPatternParsedCmd from './CmdPatternParsedCmd';

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
			'charLog',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.fieldTypes = {};
		this.parseCache = {};
		this.pruneTimer = null;
		this.module.cmd.addCmdHandler({
			id: 'cmdPattern',
			factory: (elseStep, prefix) => new CmdPatternStep(this.module, () => this._getPatterns(), { else: elseStep, prefix }),
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
			return [];
		}

		let cmds = Object.keys(props)
			.map(cmdId => props[cmdId])
			.filter(o => o.cmd)
			.sort((a, b) => b.priority - a.priority);

		/** @type {Array<CmdPatternParsedCmd>} */
		let parsed = [];
		let ids = {};
		// Parse commands or get them from cache
		for (let { id, cmd } of cmds) {
			ids[id] = true;
			let o = this.parseCache[id];
			if (!o) {
				o = new CmdPatternParsedCmd(this.module, id, cmd);
				this.parseCache[id] = o;
			}
			parsed.push(o);
		}

		this._pruneParseCache();

		return parsed;
	}

	_pruneParseCache() {
		if (this.pruneTimer) return;

		this.pruneTimer = setTimeout(() => {
			this.pruneTimer = null;
			let used = {};
			let chars = this.module.player.getControlled();
			if (chars) {
				// Get room cmds for all controlled chars
				for (let char of chars) {
					let props = char?.inRoom?.cmds?.props;
					for (let cmdId in props) {
						used[cmdId] = true;
					}
				}
			}
			// Delete unused items
			for (let cmdId in this.parseCache) {
				if (!used[cmdId]) {
					delete this.parseCache[cmdId];
				}
			}
		}, 1000 * 60 * 5); // Prune at most every 5 minutes;
	}


	dispose() {
		this.module.cmd.removeCmdHandler('cmdPattern');
	}
}

export default CmdPattern;
