import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'deny control <span class="opt"><span class="param">Character</span></span> <span class="opt">= <span class="param">Message</span></span>';
const shortDesc = 'Deny control of a puppet';
const helpText =
`<p>Deny control of a puppet to one more more characters who has requested to take over control.</p>
<p><code class="param">Character</code> is the optional name of the character to deny control to. Defaults to any requesting character.</p>
<p><code class="param">Message</code> is the optional message to include in the request denial.</p>`;

/**
 * Deny adds the deny control command.
 */
class DenyControl {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'player', 'charLog', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addPrefixCmd('deny', {
			key: 'control',
			next: [
				new ListStep('charId', this.module.cmdLists.getAllChars(), {
					textId: 'charName',
					name: "character",
					errRequired: null
				}),
				new DelimStep("=", {
					next: new TextStep('msg', {
						spanLines: false,
						maxLength: () => this.module.info.getCore().communicationMaxLength,
						errTooLong: communicationTooLong,
						errRequired: null
					}),
					errRequired: null
				}),
			],
			value: (ctx, p) => this.denyControl(ctx.char, p)
		});

		this.module.help.addTopic({
			id: 'denyControl',
			category: 'puppets',
			cmd: 'deny control',
			usage: l10n.l('denyControl.usage', usageText),
			shortDesc: l10n.l('denyControl.shortDesc', shortDesc),
			desc: l10n.l('denyControl.helpText', helpText),
			sortOrder: 110,
		});
	}

	denyControl(char, params) {
		return (params.charId
			? Promise.resolve({ id: params.charId })
			: params.charName
				? this.module.player.getPlayer().call('getChar', { charName: params.charName })
				: Promise.resolve({})
		)
			.then(c => char.call('controlRequestReject', { charId: c.id, msg: params.msg ? params.msg.trim() : undefined }))
			.then(() => {
				this.module.charLog.logInfo(char, l10n.l('denyControl.controlRequestRejected', "Control request was rejected."));
			});
	}
}

export default DenyControl;
