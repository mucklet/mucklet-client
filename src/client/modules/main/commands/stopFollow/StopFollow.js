import l10n from 'modapp-l10n';

const usageText = 'stop follow';
const shortDesc = 'Stop following a character';
const helpText =
`<p>Stop following a character around.</p>
<p>Alias: <code>hopoff</code></p>`;

/**
 * Follow adds the stop follow command.
 */
class Follow {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('stop', {
			key: 'follow',
			value: (ctx, p) => this.stopFollow(ctx.char),
		});
		// Add alias
		this.module.cmd.addCmd({
			key: 'hopoff',
			value: (ctx, p) => this.stopFollow(ctx.char),
		});

		this.module.help.addTopic({
			id: 'stopFollow',
			category: 'transport',
			cmd: 'stop follow',
			alias: [ 'hopoff' ],
			usage: l10n.l('stopFollow.usage', usageText),
			shortDesc: l10n.l('stopFollow.shortDesc', shortDesc),
			desc: l10n.l('stopFollow.helpText', helpText),
			sortOrder: 150,
		});
	}

	stopFollow(char) {
		return char.call('stopFollow');
	}
}

export default Follow;
