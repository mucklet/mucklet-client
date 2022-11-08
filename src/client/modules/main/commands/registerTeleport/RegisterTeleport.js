import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';

const usageText = 'register teleport <span class="param">Keyword</span>';
const shortDesc = 'Register current room as a teleport destination';
const helpText =
`<p>Register current room as a teleport destination, if the room is a teleport node.</p>
<p><code class="param">Keyword</code> is the keyword to use for the teleport destination.</p>`;

/**
 * RegisterTeleport adds command to register a room as a teleport destination.
 */
class RegisterTeleport {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('register', {
			key: 'teleport',
			next: [
				new DelimStep("=", { errRequired: null }),
				new TextStep('key', {
					regex: /^[\w\s]*\w/,
					name: "teleport destination keyword",
				}),
			],
			value: (ctx, p) => this.registerTeleport(ctx.char, {
				key: p.key,
				roomId: ctx.char.inRoom.id,
			}),
		});

		this.module.help.addTopic({
			id: 'registerTeleport',
			category: 'transport',
			cmd: 'register teleport',
			usage: l10n.l('registerTeleport.usage', usageText),
			shortDesc: l10n.l('registerTeleport.shortDesc', shortDesc),
			desc: l10n.l('registerTeleport.helpText', helpText),
			sortOrder: 220,
		});
	}

	registerTeleport(char, params) {
		return char.call('addTeleport', params).then(result => {
		 	this.module.charLog.logInfo(char, l10n.l('registerTeleport.registeredTeleportDestination', "Registered room as a teleport destination."));
		});
	}
}

export default RegisterTeleport;
