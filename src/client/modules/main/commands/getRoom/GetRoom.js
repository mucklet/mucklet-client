import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';

const usageText = 'get room <span class="param">Attribute</span>';
const shortDesc = 'Get info about current room';
const helpText =
`<p>Get the value of a room attribute.</p>
<table class="tbl-small">
<thead><tr><th><code class="param">Attribute</code></th><th>Value</th></tr></thead>
<tbody>
<tr><td><code>id</code></td><td>ID of the room.</td></tr>
<tr><td><code>owner</code></td><td>Owner of the room.</td></tr>
</tbody>
</table>`;

/**
 * GetRoom adds command to print room ID.
 */
class GetRoom {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.roomAttr = new ItemList({
			items: [
				{ key: 'id' },
				{ key: 'owner' }
			]
		});

		this.module.cmd.addPrefixCmd('get', {
			key: 'room',
			next: new ListStep('attr', this.roomAttr, {
				name: "room attribute",
				token: 'attr'
			}),
			value: (ctx, p) => this.getRoom(ctx.char, p.attr)
		});

		this.module.help.addTopic({
			id: 'getRoom',
			category: 'buildRooms',
			cmd: 'get room',
			usage: l10n.l('getRoom.usage', usageText),
			shortDesc: l10n.l('getRoom.shortDesc', shortDesc),
			desc: l10n.l('getRoom.helpText', helpText),
			sortOrder: 30,
		});
	}

	getRoom(char, attr) {
		let r = char.inRoom;
		switch (attr) {
			case 'id':
				this.module.charLog.logInfo(char, l10n.l('getRoom.roomHasId', "{name} has ID #{roomId}", { name: r.name.replace(/([^.])\.$/, "$1"), roomId: r.id }));
				break;
			case 'owner':
				this.module.charLog.logInfo(char, l10n.l('getRoom.roomHasOwner', "{name} has owner {owner}", { name: r.name.replace(/([^.])\.$/, "$1"), owner: (r.owner.name + " " + r.owner.surname).trim() }));
				break;
		}
	}
}

export default GetRoom;
