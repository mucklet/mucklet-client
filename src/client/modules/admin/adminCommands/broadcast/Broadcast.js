import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import Err from 'classes/Err';

const usageText = 'broadcast <span class="opt"><span class="param">Title</span></span> = <span class="param">Message</span>';
const shortDesc = 'Broadcast a message to everyone';
const helpText =
`<p>Broadcast a message to every connected player.</p>
<p><code class="param">Title</code> is the name title of the broadcast. It defaults to "Broadcast".</p>
<p><code class="param">Message</code> is the message to the broadcasted. It may be formatted and span multiple paragraphs.</p>`;

/**
 * Broadcast adds the broadcast command.
 */
class Broadcast {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'helpAdmin' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addCmd({
			key: 'broadcast',
			next: [
				new TextStep('title', {
					name: "title",
					regex: /^[^=]*/,
					errRequired: null,
				}),
				new DelimStep("=", {
					next: [
						new TextStep('msg', {
							spanLines: true,
							errRequired: step => new Err('broadcast.messageRequired', "What do you want to broadcast?"),
							formatText: true,
						}),
					],
				}),
			],
			value: (ctx, p) => this.broadcast(ctx.char, { title: (p.title || "").trim(), msg: p.msg.trim() }),
		});

		this.module.helpAdmin.addTopic({
			id: 'broadcast',
			cmd: 'broadcast',
			usage: l10n.l('broadcast.usage', usageText),
			shortDesc: l10n.l('broadcast.shortDesc', shortDesc),
			desc: l10n.l('broadcast.helpText', helpText),
			sortOrder: 30,
		});
	}

	broadcast(char, params) {
		let mod = this.module.player;
		return mod.getPlayer().call('broadcast', params).then(() => {
			this.module.charLog.logInfo(char, l10n.l('broadcast.broadcastSent', "Message was broadcasted."));
		});
	}
}

export default Broadcast;
