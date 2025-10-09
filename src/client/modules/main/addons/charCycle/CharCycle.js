import l10n from 'modapp-l10n';
import compareCtrlChars from 'utils/compareCtrlChars';

/**
 * CharCycle adds keyboard shortcut to cycle through controlled characters,
 * either using numbers or tab.
 */
class CharCycle {

	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onKeydown = this._onKeydown.bind(this);

		this.app.require([
			'player',
			'helpConsole',
			'info',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.helpConsole.addShortcut({
			id: 'charCycle',
			usage: '<kbd>Shift</kbd> + <kbd>Tab</kbd>',
			desc: l10n.l('charCycle.charCycleDesc', `<p>Cycle active character among currently awake characters.<p>`),
			sortOrder: 55,
		});
		this.module.helpConsole.addShortcut({
			id: 'charSelect',
			usage: '<kbd>Ctrl</kbd> + <kbd>1</kbd><kbd>2</kbd>...<kbd>9</kbd><kbd>0</kbd>',
			desc: l10n.l('charCycle.charSelectDesc', `<p>Select active character among currently awake characters.<p>`),
			sortOrder: 65,
		});

		document.addEventListener('keydown', this._onKeydown);
	}

	_onKeydown(e) {
		if (e.shiftKey && e.key === 'Tab') {
			this._cycleActive();
			e.preventDefault();
		} else if (e.ctrlKey) {
			let max = this.module.info.getCore().maxControlled || 5;
			let k = parseInt(e.key);
			if (k >= 1 && k <= max) {
				this._setActive(k - 1);
				e.preventDefault();
			}
		}
	}

	_cycleActive() {
		let ctrls = this._getSortedControlled();
		if (!ctrls || ctrls.length <= 1) return;

		let idx = ctrls.indexOf(this.module.player.getActiveChar());
		if (idx < 0) return;

		idx = (idx + 1) % ctrls.length;

		this.module.player.setActiveChar(ctrls[idx].id);
		return true;
	}

	_setActive(idx) {
		let ctrls = this._getSortedControlled();
		if (!ctrls || ctrls.length <= idx) return false;

		this.module.player.setActiveChar(ctrls[idx].id);
		return true;
	}

	/**
	 * Returns the list of controlled characters, sorted by ctrlSince.
	 * @returns {Array<Model>} Sorted array of controlled characters.
	 */
	_getSortedControlled() {
		return this.module.player.getControlled().toArray().sort(compareCtrlChars);
	}

	dispose() {
		document.removeEventListener('keydown', this._onShiftTab);
	}
}

export default CharCycle;
