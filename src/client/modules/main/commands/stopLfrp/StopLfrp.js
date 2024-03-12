import l10n from 'modapp-l10n';

const usageText = 'stop lfrp';
const shortDesc = 'Stop looking for roleplay';
const helpText =
`<p>Stop looking for roleplay.</p>
<p>Use <code>lfrp</code> to start looking for roleplay again.</p>`;


const txtSetAsNotLfrp = l10n.l('lfrp.setAsNotLookingForRoleplay', "Set as not looking for roleplay.");

/**
 * StopLfrp adds the stopLfrp command.
 */
class StopLfrp {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'help',
			'charLog',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addPrefixCmd('stop', {
			key: 'lfrp',
			value: (ctx, p) => this.stopLfrp(ctx.char),
		});

		this.module.help.addTopic({
			id: 'stopLfrp',
			category: 'basic',
			cmd: 'stop lfrp',
			usage: l10n.l('stopLfrp.usage', usageText),
			shortDesc: l10n.l('stopLfrp.shortDesc', shortDesc),
			desc: l10n.l('stopLfrp.helpText', helpText),
			sortOrder: 120,
		});
	}

	stopLfrp(char) {
		return char.call('set', { rp: '' }).then(() => {
			this.module.charLog.logInfo(char, txtSetAsNotLfrp);
		});
	}
}

export default StopLfrp;
