import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

/**
 * SetRoomOwner adds the setRoom attribute to set the room owner.
 */
class SetRoomOwner {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmdLists', 'setRoom', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.setRoom.addAttribute({
			key: 'owner',
			stepFactory: () => new ListStep('charId', this.module.cmdLists.getAllChars(), {
				textId: 'charName',
				name: "new owner",
				errRequired: step => ({ code: 'setRoomOwner.characterRequired', message: "Who do you want to set as new owner?" })
			}),
			desc: l10n.l('setRoomOwner.ownerDesc', "Name of the new owner. To give ownership to another player's character, use the <code>request room owner</code> command instead."),
			value: (ctx, p) => this.setRoomOwner(ctx.char, p.charId
				? { charId: p.charId, roomId: ctx.char.inRoom.id }
				: { charName: p.charName, roomId: ctx.char.inRoom.id }
			),
			sortOrder: 100
		});
	}

	setRoomOwner(char, params) {
		return char.call('setRoomOwner', params).then(result => {
			let c = result.newOwner;
			this.module.charLog.logInfo(char, l10n.l('setRoomOwner.roomOwnerSet', "Room owner was successfully set to {fullname}.", { fullname: (c.name + ' ' + c.surname).trim() }));
		});
	}
}

export default SetRoomOwner;
