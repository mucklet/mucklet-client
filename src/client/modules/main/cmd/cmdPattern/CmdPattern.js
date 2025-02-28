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
		this.module = module;
		this.module.cmd.addCmdHandler({
			id: 'cmdPatterns',
			factory: (elseStep) => new CmdPatternStep(this.module, () => this._getPatterns(), { else: elseStep }),
			sortOrder: 10,
		});
	}

	_getPatterns() {
		let props = this.module.player.getActiveChar()?.inRoom?.cmds?.props;
		if (!props) {
			return null;
		}

		return Object.keys(props)
			.map(key => props[key])
			.filter(o => o.cmd)
			.sort((a, b) => a.priority - b.priority)
			.map(o => o.cmd);
	}

	dispose() {
		this.module.cmd.removeCmdHandler('cmdPatterns');
	}
}

export default CmdPattern;
