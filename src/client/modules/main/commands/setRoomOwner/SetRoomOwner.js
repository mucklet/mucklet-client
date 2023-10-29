import l10n from 'modapp-l10n';
import Err from 'classes/Err';

/**
 * SetRoomOwner adds the setRoom attribute to set the room owner.
 */
class SetRoomOwner {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmdSteps', 'setRoom', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.setRoom.addAttribute({
			key: 'owner',
			stepFactory: () => this.module.cmdSteps.newAnyCharStep({
				errRequired: step => new Err('setRoomOwner.characterRequired', "Who do you want to set as new owner?"),
				sortOrder: [ 'awake', 'watch', 'room' ],
			}),
			desc: l10n.l('setRoomOwner.ownerDesc', "Name of the new owner. To give ownership to another player's character, use the <code>request room owner</code> command instead."),
			value: (ctx, p) => this.setRoomOwner(ctx.char, p.charId
				? { charId: p.charId, roomId: ctx.char.inRoom.id }
				: { charName: p.charName, roomId: ctx.char.inRoom.id },
			),
			sortOrder: 100,
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
