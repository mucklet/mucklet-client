import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';

const usageText = 'unregister teleport <span class="param">Keyword<span class="comment">';
const shortDesc = 'Unregister a previously registered teleport destination';
const helpText =
`<p>Unregister a previously registered teleport destination.</p>
<p><code class="param">Keyword</code> is the keyword of the teleport destination.</p>`;

/**
 * UnregisterTeleport adds command to unregister a teleport destination.
 */
class UnregisterTeleport {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('unregister', {
			key: 'teleport',
			next: [
				new DelimStep("=", { errRequired: null }),
				new ListStep('nodeId', this.module.cmdLists.getTeleportNodes(), {
					name: "teleport node to unregister",
				}),
			],
			value: (ctx, p) => this.unregisterTeleport(ctx.char, {
				nodeId: p.nodeId,
			}),
		});

		this.module.help.addTopic({
			id: 'unregisterTeleport',
			category: 'transport',
			cmd: 'unregister teleport',
			usage: l10n.l('unregisterTeleport.usage', usageText),
			shortDesc: l10n.l('unregisterTeleport.shortDesc', shortDesc),
			desc: l10n.l('unregisterTeleport.helpText', helpText),
			sortOrder: 240,
		});
	}

	unregisterTeleport(char, params) {
		return char.call('removeTeleport', params).then(result => {
		 	this.module.charLog.logInfo(char, l10n.l('unregisterTeleport.unregisteredTeleportDestination', "Unregistered teleport destination to {roomName}.", { roomName: result.room.name }));
		});
	}
}

export default UnregisterTeleport;
