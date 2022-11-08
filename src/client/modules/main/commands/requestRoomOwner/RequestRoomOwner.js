import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';

const usageText = 'request room owner = <span class="param">Character</span>';
const shortDesc = "Request to give room ownership to someone else's character";
const helpText =
`<p>Request to change room ownership to another player's character.</p>
<p><code class="param">Character</code> is the name of the character to transfer room ownership to.</p>`;

/**
 * RequestRoomOwner adds command to request to changed room owner to a character
 * owned by another player.
 */
class RequestRoomOwner {
	constructor(app) {
		this.app = app;

		this.app.require([ 'requestRoom', 'cmdLists', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.requestRoom.getRoomAttr().addItem({
			key: 'owner',
			next: [
				new DelimStep("=", { errRequired: null }),
				new ListStep('charId', this.module.cmdLists.getAllChars(), {
					textId: 'charName',
					name: "new owner",
					errRequired: step => ({ code: 'requestRoomOwner.characterRequired', message: "Who do you want to transfer ownership to?" }),
				}),
			],
			value: (ctx, p) => this.requestRoomOwner(ctx.char, p.charId
				? { charId: p.charId, roomId: ctx.char.inRoom.id }
				: { charName: p.charName, roomId: ctx.char.inRoom.id },
			),
		});

		this.module.help.addTopic({
			id: 'requestRoomOwner',
			category: 'request',
			cmd: 'request room owner',
			usage: l10n.l('requestRoomOwner.usage', usageText),
			shortDesc: l10n.l('requestRoomOwner.shortDesc', shortDesc),
			desc: l10n.l('requestRoomOwner.helpText', helpText),
			sortOrder: 100,
		});
	}

	requestRoomOwner(char, params) {
		return char.call('requestSetRoomOwner', params).then(result => {
			this.module.charLog.logInfo(char, l10n.l('requestRoomOwner.roomOwnerRequested', "Requested to set {newOwner} as the new room owner.", { newOwner: (result.newOwner.name + ' ' + result.newOwner.surname).trim() }));
		});
	}
}

export default RequestRoomOwner;
