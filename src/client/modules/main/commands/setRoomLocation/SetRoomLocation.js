import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import NumberStep from 'classes/NumberStep';
import DelimStep from 'classes/DelimStep';

/**
 * SetRoomLocation adds command to set the room's location attributes.
 */
class SetRoomLocation {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmdLists', 'setRoom', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.setRoom.addAttribute({
			key: 'private',
			stepFactory: () => new ListStep('private', this.module.cmdLists.getBool(), { name: "private flag" }),
			desc: l10n.l('setRoomLocation.privateDesc', "Flag telling if the room is private, preventing it from being listed in the area. Requires area ownership. Value is <code>yes</code> or <code>no</code>."),
			value: (ctx, p) => this.setRoomLocation(ctx.char, { private: p.private }),
			sortOrder: 200,
		});
		this.module.setRoom.addAttribute({
			key: 'position',
			stepFactory: () => ([
				new NumberStep('mapx', { name: "area map X position" }),
				new DelimStep(",", { errRequired: null }),
				new NumberStep('mapy', { name: "area map Y position" }),
			]),
			desc: l10n.l('setRoomLocation.positionDesc', "The X,Y pixel coordinates of the room's position on the area's map image, starting with 0,0 in the top-left corner. Requires area ownership."),
			value: (ctx, p) => this.setRoomLocation(ctx.char, { mapX: p.mapx, mapY: p.mapy }),
			sortOrder: 210,
		});
	}

	setRoomLocation(char, params) {
		return char.call('setLocation', Object.assign({ locationId: char.inRoom.id, type: 'room' }, params)).then(() => {
			this.module.charLog.logInfo(char, l10n.l('setRoomLocation.roomLocationSet', "Room location attribute was successfully set"));
		});
	}
}

export default SetRoomLocation;
