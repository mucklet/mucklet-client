import l10n from 'modapp-l10n';
import IDStep from 'classes/IDStep';
import ListStep from 'classes/ListStep';

const usageText = 'teleport <span class="param">Keyword<span class="comment">/</span>#RoomID</span>';
const shortDesc = 'Teleport to another room';
const helpText =
`<p>Teleport to another room either by keyword or room ID.</p>
<p><code class="param">Keyword</code> is the keyword of the teleport destination.</p>
<p><code class="param">#RoomID</code> is the ID of a room your character owns.</p>
<p>Alias: <code>t</code>, <code>tp</code>, <code>tport</code></p>`;

/**
 * Teleport adds the teleport command.
 */
class Teleport {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'teleport',
			alias: [ 't', 'tp', 'tport' ],
			next: new IDStep('roomId', {
				name: "destination node or room ID",
				list: () => {
					let c = module.player.getActiveChar();
					return ((c && c.ownedRooms & c.ownedRooms.toArray()) || []).map(v => v.id);
				},
				else: new ListStep('nodeId', this.module.cmdLists.getTeleportNodes(), {
					name: "destination node",
				}),
			}),
			value: this.teleport.bind(this),
		});

		this.module.help.addTopic({
			id: 'teleport',
			category: 'transport',
			cmd: 'teleport',
			alias: [ 't', 'tp', 'tport' ],
			usage: l10n.l('teleport.usage', usageText),
			shortDesc: l10n.l('teleport.shortDesc', shortDesc),
			desc: l10n.l('teleport.helpText', helpText),
			sortOrder: 200,
		});
	}

	teleport(ctx, p) {
		return ctx.char.call('teleport', p.nodeId ? { nodeId: p.nodeId } : { roomId: p.roomId });
	}
}

export default Teleport;
