import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';

const usageText = 'register puppet <span class="param">Puppet</span>';
const shortDesc = 'Register a puppet character';
const helpText =
`<p>Register a puppet character to allow you to wake them up and control them. The command will send a register request to the puppet owner.</p>
<p><code class="param">Puppet</code> is the puppet character to register.</p>`;

/**
 * RegisterPuppet adds command to add a room as a teleport destination.
 */
class RegisterPuppet {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('register', {
			key: 'puppet',
			next: [
				new DelimStep("=", { errRequired: null }),
				new ListStep('charId', this.module.cmdLists.getInRoomPuppets(), {
					name: "character",
					errRequired: null,
				}),
			],
			value: (ctx, p) => this.registerPuppet(ctx.char, {
				charId: p.charId
			})
		});

		this.module.help.addTopic({
			id: 'registerPuppet',
			category: 'puppets',
			cmd: 'register puppet',
			usage: l10n.l('registerPuppet.usage', usageText),
			shortDesc: l10n.l('registerPuppet.shortDesc', shortDesc),
			desc: l10n.l('registerPuppet.helpText', helpText),
			sortOrder: 10,
		});
	}

	registerPuppet(char, params) {
		return char.call('registerPuppet', params).then(result => {
		 	this.module.charLog.logInfo(char, l10n.l('registerPuppet.teleportDestinationAdded', "A request to register the puppet is sent."));
		});
	}
}

export default RegisterPuppet;
