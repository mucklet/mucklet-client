import l10n from 'modapp-l10n';

/**
 * CharCycle adds keyboard shortcut to cycle through controlled characters,
 * either using numbers or tab.
 */
class CharCycle {

	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onKeydown = this._onKeydown.bind(this);

		this.app.require([ 'player', 'helpConsole' ], this._init.bind(this));
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
			if (this._cycleActive()) {
				e.preventDefault();
			}
		} else if (e.ctrlKey) {
			let k = parseInt(e.key);
			if (!isNaN(k) && this._setActive((k + 9) % 10)) {
				e.preventDefault();
			}
		}
	}

	_cycleActive() {
		let ctrls = this.module.player.getControlled();
		if (!ctrls || ctrls.length <= 1) return;

		let idx = ctrls.indexOf(this.module.player.getActiveChar());
		if (idx < 0) return;

		idx = (idx + 1) % ctrls.length;

		this.module.player.setActiveChar(ctrls.atIndex(idx).id);
		return true;
	}

	_setActive(idx) {
		let ctrls = this.module.player.getControlled();
		if (!ctrls || ctrls.length <= idx) return;

		this.module.player.setActiveChar(ctrls.atIndex(idx).id);
		return true;
	}

	dispose() {
		document.removeEventListener('keydown', this._onShiftTab);
	}
}

export default CharCycle;
