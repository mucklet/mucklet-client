import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'request help <span class="opt">= <span class="param">Message</span></span>';
const shortDesc = 'Request help from the helpers';
const helpText =
`<p>Request help from one of the helpers who will contact you. Help requests may be about anything; how to find a place, how a command works, or how to report someone being disrespectful.</p>
<p><code class="param">Message</code> is the optional help message. It may be formatted and span multiple paragraphs.</p>`;
const examples = [
	{ cmd: 'request help', desc: l10n.l('requestHelp.requestHelpExampleDesc', "Requests help without a message") },
	{ cmd: 'request help = How to make text bold?', desc: l10n.l('requestHelp.helpHelpWithMessageExampleDesc', "Requests help with a message") },
];

/**
 * RequestHelp adds the help command.
 */
class RequestHelp {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'help',
			'api',
			'charLog',
			'info',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addPrefixCmd('request', {
			key: 'help',
			next: [
				new DelimStep("=", { errRequired: null }),
				new TextStep('msg', {
					spanLines: true,
					maxLength: () => this.module.info.getSupport().ticketMsgMaxLength,
					errTooLong: communicationTooLong,
					errRequired: null,
					completer: this.module.cmdLists.getCharsAwake(),
					formatText: true,
				}),
			],
			value: (ctx, p) => this.requestHelp(ctx.player, ctx.char, p),
		});

		this.module.help.addTopic({
			id: 'requestHelp',
			category: [ 'basic', 'helper', 'request' ],
			cmd: 'request help',
			usage: l10n.l('requestHelp.usage', usageText),
			shortDesc: l10n.l('requestHelp.shortDesc', shortDesc),
			desc: l10n.l('requestHelp.helpText', helpText),
			examples,
			sortOrder: 15,
		});
	}

	requestHelp(player, char, params) {
		return this.module.api.call('support.tickets', 'create', {
			charId: char.id,
			msg: params.msg || null,
		}).then(() => {
			this.module.charLog.logInfo(char, l10n.l('requestHelp.helpRequestSent', "The help request was sent. A helper will soon try to contact you."));
		});
	}
}

export default RequestHelp;
