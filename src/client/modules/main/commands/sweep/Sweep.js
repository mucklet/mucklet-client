import l10n from 'modapp-l10n';

const usageText = 'sweep <span class="opt"><span class="param">Character</span></span>';
const shortDesc = 'Send home sleeping characters';
const helpText =
`<p>Sweep the room clean of sleeping characters by sending them home, or send a single awake character home from a room you own.</p>
<p><code class="param">Character</code> is the optional name of the character to send home. By default all sleepers are sent home.</p>`;

/**
 * Sweep adds the sweep command.
 */
class Sweep {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdSteps',
			'help',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'sweep',
			next: this.module.cmdSteps.newInRoomCharStep({
				errRequired: null,
			}),
			value: (ctx, p) => this.sweep(ctx.char, p.charId ? { charId: p.charId } : null),
		});

		this.module.help.addTopic({
			id: 'sweep',
			category: 'cleanup',
			cmd: 'sweep',
			usage: l10n.l('sweep.usage', usageText),
			shortDesc: l10n.l('sweep.shortDesc', shortDesc),
			desc: l10n.l('sweep.helpText', helpText),
			sortOrder: 20,
		});
	}

	sweep(char, params) {
		return char.call('sweep', params);
	}
}

export default Sweep;
