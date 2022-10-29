import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import { itemNameTooLong } from 'utils/cmdErr';

const usageText = 'create room <span class="opt"><span class="param">Name</span></span>';
const shortDesc = 'Create a new room';
const helpText =
`<p>Create a new room and teleport your character there.</p>
<p><code class="param">Name</code> is the name of the room. If omitted, the room will get a default name.</p>`;

/**
 * CreateRoom adds command to create a new room.
 */
class CreateRoom {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('create', {
			key: 'room',
			next: [
				new TextStep('name', {
					errRequired: null,
					maxLength: () => module.info.getCore().itemNameMaxLength,
					errTooLong: itemNameTooLong,
				}),
			],
			value: (ctx, p) => this.createRoom(ctx.char, {
				name: (p.name || '').trim()
			})
		});

		this.module.help.addTopic({
			id: 'createRoom',
			category: 'buildRooms',
			cmd: 'create room',
			usage: l10n.l('createRoom.usage', usageText),
			shortDesc: l10n.l('createRoom.shortDesc', shortDesc),
			desc: l10n.l('createRoom.helpText', helpText),
			sortOrder: 10,
		});
	}

	createRoom(char, params) {
		return char.call('createRoom', params).then(room => {
			this.module.charLog.logInfo(char, l10n.l('createRoom.roomCreated', "Created room \"{name}\".", { name: room.name }));
			return char.call('teleport', { roomId: room.id });
		});
	}
}

export default CreateRoom;
