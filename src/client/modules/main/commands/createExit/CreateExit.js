import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import prepareKeys from 'utils/prepareKeys';
import { itemNameTooLong } from 'utils/cmdErr';

const usageText = 'create exit <span class="param">Name</span> <span class="opt">= <span class="param">#RoomID<span class="comment">/</span>Room</span></span>';
const shortDesc = 'Create a new exit';
const helpText =
`<p>Create a new exit from current room. If no destination room ID or name is provided, a new empty room will be created.</p>
<p><code class="param">Name</code> is the exit name and keyword used with the <code>go</code> command.</p>
<p><code class="param">#RoomID</code> is the optional ID of the destination room.</p>
<p><code class="param">Room</code> is the optional name of an owned destination room.</p>
<p>A room's ID can be obtained using the <code>get room id</code> command.</p>
<p>If another player's character owns the destination room, you must instead make a request using the <code>request exit</code> command.</p>`;


/**
 * CreateExit adds command to create a new room exit.
 */
class CreateExit {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help', 'player', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('create', {
			key: 'exit',
			next: [
				new TextStep('name', {
					regex: /^[^=]*[^=\s]/,
					maxLength: () => module.info.getCore().itemNameMaxLength,
					errTooLong: itemNameTooLong,
				}),
				new DelimStep("=", {
					errRequired: null,
					next: new IDStep('targetRoom', {
						name: "target room ID",
						list: () => {
							let c = module.player.getActiveChar();
							return ((c && c.ownedRooms && c.ownedRooms.toArray()) || []).map(v => v.id);
						},
						else: new ListStep('targetRoom', module.cmdLists.getCharOwnedRooms(), {
							name: "target room"
						})
					})
				})
			],
			value: (ctx, p) => this.createExit(ctx.char, {
				name: p.name.trim(),
				keys: prepareKeys(p.name),
				targetRoom: p.targetRoom
			})
		});

		this.module.help.addTopic({
			id: 'createExit',
			category: 'buildRooms',
			cmd: 'create exit',
			usage: l10n.l('createExit.usage', usageText),
			shortDesc: l10n.l('createExit.shortDesc', shortDesc),
			desc: l10n.l('createExit.helpText', helpText),
			sortOrder: 60,
		});
	}

	createExit(char, params) {
		return char.call('createExit', params).then(result => {
			this.module.charLog.logInfo(char, l10n.l('createExit.exitCreated', "Created exit \"{exitName}\" to \"{targetRoomName}\".", { exitName: result.exit.name, targetRoomName: result.targetRoom.name }));
		});
	}
}

export default CreateExit;
