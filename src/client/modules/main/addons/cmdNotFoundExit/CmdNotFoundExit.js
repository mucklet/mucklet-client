import { Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

/**
 * CmdNotFoundExit adds a command not found handler that detects if the player
 * tried to use an exit with prefixing it with 'go'.
 */
class CmdNotFoundExit {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onNotFound = this._onNotFound.bind(this);

		this.app.require([ 'cmd', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.cmd.addNotFoundHandler({
			id: 'exit',
			onNotFound: (ctx, m, str) => this._onNotFound(ctx, str),
			sortOrder: 10,
		});
	}

	_onNotFound(ctx, str) {
		let exits = ctx.char && ctx.char.inRoom && ctx.char.inRoom.exits;
		if (!exits) return;

		str = str.trim().toLowerCase().replace(/\s+/g, ' ');
		for (let exit of exits) {
			for (let key of exit.keys) {
				if (key == str) {
					return new Html(
						l10n.t('cmdNotFoundExit.exitUsage', 'To use the exit, type <span class="cmd">go {key}</span> instead, or type <span class="cmd">help go</span> to learn more.', { key: escapeHtml(key) }),
						{ className: 'common--formattext' },
					);
				}
			}
		}
	}

	dispose() {
		this.module.cmd.removeNotFoundHandler('exit');
	}
}

export default CmdNotFoundExit;
