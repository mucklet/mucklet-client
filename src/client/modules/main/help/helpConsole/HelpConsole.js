import { Collection, sortOrderCompare } from 'modapp-resource';
import l10n from 'modapp-l10n';
import HelpConsoleComponent from './HelpConsoleComponent';
import './helpConsole.scss';

const shortcuts = [
	{
		id: 'tabcompletion',
		usage: '<kbd>Tab</kbd>',
		desc: l10n.l('helpConsole.tabcompletionDesc', `<p>Complete the current command or name. Cycle through all options by pressing the key repeatedly.<p>`),
		sortOrder: 10,
	},
	{
		id: 'linebreak',
		usage: '<kbd>Shift</kbd>/<kbd>Ctrl</kbd> + <kbd>Enter</kbd>',
		desc: l10n.l('helpConsole.linebreakDesc', `<p>Insert a line break in the console.<p>`),
		sortOrder: 20,
	},
	{
		id: 'history',
		usage: '<kbd>Ctrl</kbd> + <kbd>Up</kbd>/<kbd>Down</kbd>',
		desc: l10n.l('helpConsole.historyDesc', `<p>Cycle through editor history. Any text currently in the console will be saved to history.<p>`),
		sortOrder: 30,
	},
	// {
	// 	id: 'autocompletion',
	// 	usage: '<kbd>Ctrl</kbd> + <kbd>Space</kbd>',
	// 	desc: l10n.l('helpConsole.autocompletionDesc', `<p>Open auto-completion. Use <kbd>Up</kbd>/<kbd>Down</kbd> to change selection and confirm with <kbd>Tab</kbd> or <kbd>Enter</kbd>.<p>`),
	// 	sortOrder: 40
	// },
];

/**
 * HelpConsole adds the console help category and allows other modules to registers keyboard shortcuts.
 */
class HelpConsole {

	constructor(app, params) {
		this.app = app;
		this.app.require([ 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.shortcuts = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});

		for (let shortcut of shortcuts) {
			this.addShortcut(shortcut);
		}

		this.module.help.addCategory({
			id: 'console',
			title: l10n.l('help.consoleTitle', "Console tips and tricks"),
			shortDesc: l10n.l('help.consoleTitle', "Learn about console features and keyboard shortcuts"),
			desc: () => new HelpConsoleComponent(this.module, this.shortcuts),
			sortOrder: 15,
		});
	}

	/**
	 * Get a collection of help shortcuts.
	 * @returns {Collection} Collection of shortcuts.
	 */
	getShortcuts() {
		return this.shortcuts;
	}

	/**
	 * Registers a shortcut.
	 * @param {object} shortcut Shortcut object
	 * @param {string} shortcut.id Shortcut ID.
	 * @param {LocaleString} shortcut.usage Shortcut title.
	 * @param {LocaleString} shortcut.desc Shortcut description.
	 * @param {number} shortcut.sortOrder Sort order.
	 * @returns {this}
	 */
	addShortcut(shortcut) {
		if (this.shortcuts.get(shortcut.id)) {
			throw new Error("Shortcut ID already registered: ", shortcut.id);
		}
		this.shortcuts.add(shortcut);
		return this;
	}

	/**
	 * Unregisters a previously registered shortcut.
	 * @param {string} shortcutId Shortcut ID.
	 * @returns {this}
	 */
	removeShortcut(shortcutId) {
		this.shortcuts.remove(shortcutId);
		return this;
	}

	dispose() {
		this.module.help.removeCategory('console');
	}
}

export default HelpConsole;
