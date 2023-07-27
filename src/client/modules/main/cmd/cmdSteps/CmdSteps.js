import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';

const errCharacterRequired = { code: 'inspect.characterRequired', message: "Which character?" };
const defaultIDStepName = "character name or ID";
const defaultCharIdName = "character";

/**
 * CmdSteps holds different types of command steps.
 */
class CmdSteps {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmdLists',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Creates a new owned character step.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.id] Id used as key when setting param values. Defaults to 'charId'.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this). Defaults to "Which character?"
	 * @returns {IDStep}
	 */
	newOwnedCharStep(opt) {
		let id = opt?.id || 'charId';
		return new IDStep(id, {
			name: defaultIDStepName,
			else: new ListStep(id, this.module.cmdLists.getOwnedChars(), {
				name: defaultCharIdName,
				errRequired: opt && opt.hasOwnProperty('errRequired') ? opt.errRequired : (step => errCharacterRequired),
			}),
		});
	}

	/**
	 * Creates a new in room character step.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.id] Id used as key when setting param values. Defaults to 'charId'.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this). Defaults to "Which character?"
	 * @returns {IDStep}
	 */
	newInRoomCharStep(opt) {
		let id = opt?.id || 'charId';
		return new IDStep(id, {
			name: defaultIDStepName,
			else: new ListStep(id, this.module.cmdLists.getInRoomChars(), {
				name: defaultCharIdName,
				errRequired: opt && opt.hasOwnProperty('errRequired') ? opt.errRequired : (step => errCharacterRequired),
			}),
		});
	}

	/**
	 * Creates a new in room awake character step.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.id] Id used as key when setting param values. Defaults to 'charId'.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this). Defaults to "Which character?"
	 * @param {Step} [opt.next] Next step after matching a character.
	 * @returns {IDStep}
	 */
	newInRoomAwakeCharStep(opt) {
		let id = opt?.id || 'charId';
		return new IDStep(id, {
			name: defaultIDStepName,
			else: new ListStep(id, this.module.cmdLists.getInRoomCharsAwake(), {
				name: defaultCharIdName,
				errRequired: opt && opt.hasOwnProperty('errRequired') ? opt.errRequired : (step => errCharacterRequired),
				next: opt?.next,
			}),
			next: opt?.next,
		});
	}

	/**
	 * Creates a new in room puppet step.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.id] Id used as key when setting param values. Defaults to 'charId'.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this). Defaults to "Which character?"
	 * @returns {IDStep}
	 */
	newInRoomPuppetStep(opt) {
		let id = opt?.id || 'charId';
		return new IDStep(id, {
			name: defaultIDStepName,
			else: new ListStep(id, this.module.cmdLists.getInRoomPuppets(), {
				name: defaultCharIdName,
				errRequired: opt && opt.hasOwnProperty('errRequired') ? opt.errRequired : (step => errCharacterRequired),
			}),
		});
	}

	/**
	 * Creates a new awake char.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.id] Id used as key when setting param values. Defaults to 'charId'.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this). Defaults to "Which character?"
	 * @returns {IDStep}
	 */
	newAwakeCharStep(opt) {
		let id = opt?.id || 'charId';
		return new IDStep(id, {
			name: defaultIDStepName,
			else: new ListStep(id, this.module.cmdLists.getCharsAwake(), {
				name: defaultCharIdName,
				errRequired: opt && opt.hasOwnProperty('errRequired') ? opt.errRequired : (step => errCharacterRequired),
			}),
		});
	}

	/**
	 * Creates a new watched char step.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.id] Id used as key when setting param values. Defaults to 'charId'.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this). Defaults to "Which character?"
	 * @returns {IDStep}
	 */
	newWatchedCharStep(opt) {
		let id = opt?.id || 'charId';
		return new IDStep(id, {
			name: defaultIDStepName,
			else: new ListStep(id, this.module.cmdLists.getWatchedChars(), {
				name: defaultCharIdName,
				errRequired: opt && opt.hasOwnProperty('errRequired') ? opt.errRequired : (step => errCharacterRequired),
			}),
		});
	}

	/**
	 * Creates a new any char step.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.id] Id used as key when setting param values. Defaults to 'charId'.
	 * @param {string} [opt.idName] ID step name. Defaults to "character name or ID".
	 * @param {string} [opt.name] Step name. Defaults to "character".
	 * @param {string} [opt.textId] Id used as key when param text. Defaults to 'charName'.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this). Defaults to "Which character?"
	 * @returns {IDStep}
	 */
	newAnyCharStep(opt) {
		let id = opt?.id || 'charId';
		return new IDStep(id, {
			name: opt?.idName || defaultIDStepName,
			else: new ListStep(id, this.module.cmdLists.getAllChars(), {
				textId: opt?.textId || 'charName',
				name: opt?.name || defaultCharIdName,
				errRequired: opt && opt.hasOwnProperty('errRequired') ? opt.errRequired : (step => errCharacterRequired),
			}),
		});
	}
}

export default CmdSteps;
