import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'stop lead <span class="opt"><span class="param">Character</span></span>';
const shortDesc = 'Stop having characters follow you';
const helpText =
`<p>Stop have characters following you around.</p>
<p><code class="param">Character</code> is the optional name of a specific character to stop following you.</p>
<p>Alias: <code>dropoff</code></p>`;

/**
 * Lead adds the stopLead command.
 */
class Lead {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		let opts = {
			next: [
				new ListStep('charId', this.module.cmdLists.getInRoomCharsAwake(), {
					name: "character",
					errRequired: null,
				}),
			],
			value: (ctx, p) => this.stopLead(ctx.char, p.charId ? { charId: p.charId } : null),
		};
		this.module.cmd.addPrefixCmd('stop', Object.assign({ key: 'lead' }, opts));
		this.module.cmd.addCmd(Object.assign({ key: 'dropoff' }, opts));

		this.module.help.addTopic({
			id: 'stopLead',
			category: 'transport',
			cmd: 'stop lead',
			alias: [ 'dropoff' ],
			usage: l10n.l('stopLead.usage', usageText),
			shortDesc: l10n.l('stopLead.shortDesc', shortDesc),
			desc: l10n.l('stopLead.helpText', helpText),
			sortOrder: 140,
		});
	}

	stopLead(char, params) {
		return char.call('stopLead', params);
	}
}

export default Lead;
