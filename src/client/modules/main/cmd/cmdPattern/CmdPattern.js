import l10n from 'modapp-l10n';
import ValueStep from 'classes/ValueStep';
import cmdCompare from 'utils/cmdCompare';
import CmdPatternStep from './CmdPatternStep';
import CmdPatternParsedCmd from './CmdPatternParsedCmd';
import './cmdPattern.scss';

const doUsageText = 'do <span class="field">&lt;Command&gt;</span>';
const doShortDesc = 'Execute a custom command';
const doHelpText =
`<p>Execute a custom command. Using <code>do</code> is only required when the custom command shares the same name as a client command.</p>
<p>Use <code>list commands</code> to get a list of custom commands.</p>`;
const examples = [
	{ cmd: 'do say Hi!', desc: l10n.l('cmdPattern.doSayDesc', "Calls a custom <code>say</code> command specific to the room.") },
];

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
			'help',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.fieldTypes = {};
		this.parseCache = {};
		this.pruneTimer = null;
		// Add cmd handler to work as a fallback on not found commands.
		this.module.cmd.addCmdHandler({
			id: 'cmdPattern',
			factory: (elseStep, prefix) => new CmdPatternStep(this.module, () => this._getAllPatterns(), { else: elseStep, prefix }),
			complete: (step, doc, pos, state) => step.completeCmd(doc, pos, state),
			sortOrder: 10,
		});
		// Add "do" command to work as a prefix.
		this.module.cmd.addCmd({
			key: 'do',
			next: [
				 new CmdPatternStep(this.module, () => this._getAllPatterns(), {
					doPrefixed: true,
					else: new ValueStep('cmdPattern-exec', (ctx, params) => {
						this.module.help.showTopic(ctx.char, 'do');
					}),
				}),
			],
			value: (ctx, p) => {
				let f = p['cmdPattern-exec'];
				if (f) {
					f(ctx, p);
				} else {
					console.error("CmdPatternStep didn't handle the input. How odd.");
				}
			},
		});
		// Add a help source to show help for custom commands.
		this.module.help.addSource({
			id: 'cmdPattern',
			helpTopics: (char, cmd) => this._getHelpTopics(char, cmd),
			relatedCategory: (char, cmd) => this._getRelatedRoomCommands(char, cmd),
			helpTokens: (char, prefix) => this._getHelpTokens(char, prefix),
			sortOrder: 10,
		});
		// Add help topic for "do" command.
		this.module.help.addTopic({
			id: 'do',
			category: 'basic',
			cmd: 'do',
			usage: l10n.l('cmdPattern.doUsage', doUsageText),
			shortDesc: l10n.l('cmdPattern.doShortDesc', doShortDesc),
			desc: l10n.l('cmdPattern.doHelpText', doHelpText),
			examples,
			sortOrder: 130,
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

	/**
	 * Gets help topics for a command.
	 * @param {string} id Command ID.
	 * @param {import('types/modules/cmdPattern').CmdPattern} cmd Command pattern object.
	 * @returns {{usage: string, desc?: string, examples?: Array<{ key: e.cmd, desc?: e.desc }>}} Help topic object.
	 */
	getHelpTopic(id, cmd) {
		let cmdPattern = this._getPattern(id, cmd);
		this._pruneParseCache();
		return cmdPattern.helpTopic();
	}

	_getAllPatterns() {
		let ids = {};
		let cmds = [];
		// Room commands
		cmds = cmds.concat(this._getPatterns(this.module.player.getActiveChar()?.inRoom?.cmds?.props, ids));
		return cmds;
	}

	_getPatterns(props, uniqueIds = {}) {
		if (!props) {
			return [];
		}

		let cmds = Object.keys(props)
			.map(cmdId => props[cmdId])
			.filter(o => o.cmd)
			.sort(cmdCompare);

		/** @type {Array<CmdPatternParsedCmd>} */
		let parsed = [];
		let ids = {};
		// Parse commands or get them from cache
		for (let { id, cmd } of cmds) {
			if (!ids[id]) {
				ids[id] = true;
				let o = this._getPattern(id, cmd);
				parsed.push(o);
			}
		}

		this._pruneParseCache();

		return parsed;
	}

	_getPattern(id, cmd) {
		let o = this.parseCache[id];
		if (!o) {
			o = new CmdPatternParsedCmd(this.module, id, cmd);
			this.parseCache[id] = o;
		}
		return o;
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

	/**
	 * Creates a section of related commands for the help.
	 * @param {CtrlChar} char Controlled character.
	 * @param {string} helpCmd The command that the user want help with. eg. "help <helpCmd>"
	 * @returns {{title: LocaleString, items: Array<{cmd: string, title: string}>} | null} List of related room commands.
	 */
	_getRelatedRoomCommands(char, helpCmd) {
		// Split helpCmd into words.
		let helpWords = helpCmd.toLowerCase().split(" ").filter(w => w);
		// Check for a do prefix and remove it.
		let doPrefixed = helpWords[0] == 'do';
		if (doPrefixed) {
			helpWords.shift();
		}

		if (!helpWords.length) {
			return null;
		}

		let uniqueTopics = {};
		let roomCmds = this._getPatterns(char?.inRoom?.cmds?.props)
			.map(c => {
				let m = c.matchesHelp(helpWords);
				// If it is a match and that exact topic is not added.
				if (m && !uniqueTopics[m]) {
					uniqueTopics[m] = true;
					return { cmd: c, topic: m };
				}
				return null;
			})
			.filter(o => o);
		return roomCmds.length
			? {
				title: l10n.l('cmdPattern.roomCommands', "Room commands"),
				items: roomCmds.map(o => {
					let addDoPrefix = doPrefixed || o.cmd.requiresDoPrefix(true);
					return {
						cmd: (addDoPrefix ? 'do ' : '') + o.topic,
						title: o.cmd.cmd.desc || null,
					};
				}),
			}
			: null;
	}

	_getHelpTopics(char, helpCmd) {
		// Split helpCmd into words.
		let helpWords = helpCmd.toLowerCase().split(" ").filter(w => w);
		// Check for a do prefix and remove it.
		let doPrefixed = helpWords[0] == 'do';
		if (doPrefixed) {
			helpWords.shift();
		}

		if (!helpWords.length) {
			return null;
		}

		let roomCmds = this._getPatterns(char?.inRoom?.cmds?.props);
		if (!doPrefixed) {
			roomCmds = roomCmds.filter(c => !c.requiresDoPrefix(true));
		}

		roomCmds = roomCmds
			.map(c => {
				let m = c.matchesHelp(helpWords, true);
				// If it is a match and that exact topic is not added.
				return m
					? c.helpTopic()
					: null;
			})
			.filter(o => o);

		return roomCmds.length
			? roomCmds
			: null;
	}

	_getHelpTokens(char, prefix) {
		// Split helpCmd into words.
		prefix = prefix.trim();
		let helpWords = prefix.toLowerCase().split(" ").filter(w => w);
		let wordLen = helpWords.length;
		// Check for a do prefix and remove it.
		let doPrefixed = helpWords[0] == 'do';
		if (doPrefixed) {
			helpWords.shift();
			wordLen--;
			prefix = helpWords.join(" ");
		}

		// Get all room commands.
		let roomCmds = this._getPatterns(char?.inRoom?.cmds?.props);
		if (!doPrefixed) {
			roomCmds = roomCmds.filter(c => !c.requiresDoPrefix(true));
		}

		let tokens = [];
		for (let c of roomCmds) {
			let wordTokens = c.getWordTokens();
			// Test if the word tokens matches the prefix, and that we have additional tokens.
			if (wordTokens.length > wordLen && wordTokens.slice(0, wordLen).join(' ') == prefix) {
				tokens.push(wordTokens[wordLen]);
			}
		}
		return tokens;
	}

	dispose() {
		this.module.cmd.removeCmdHandler('cmdPattern');
	}
}

export default CmdPattern;
