import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import NumberStep from 'classes/NumberStep';
import DelimStep from 'classes/DelimStep';

/**
 * SetAreaLocation adds command to set the area's location attributes.
 */
class SetAreaLocation {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmdLists', 'setArea', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.setArea.addAttribute({
			key: 'private',
			stepFactory: () => new ListStep('private', this.module.cmdLists.getBool(), { name: "private flag" }),
			desc: l10n.l('setAreaLocation.privateDesc', "Flag telling if the area is private, preventing from being listed in the parent area. Requires parent area ownership. Value is <code>yes</code> or <code>no</code>."),
			value: (ctx, p) => this.setAreaLocation(ctx.char, p.areaId, { private: p.private }),
			sortOrder: 200,
		});
		this.module.setArea.addAttribute({
			key: 'position',
			stepFactory: () => ([
				new NumberStep('mapx', { name: "parent area map X position" }),
				new DelimStep(",", { errRequired: null }),
				new NumberStep('mapy', { name: "parent area map Y position" }),
			]),
			desc: l10n.l('setAreaLocation.positionDesc', "The X,Y pixel coordinates of the area's position on the parent area's map image, starting with 0,0 in the top-left corner. Requires parent area ownership."),
			value: (ctx, p) => this.setAreaLocation(ctx.char, p.areaId, { mapX: p.mapx, mapY: p.mapy }),
			sortOrder: 210,
		});
	}

	setAreaLocation(char, areaId, params) {
		return char.call('setLocation', Object.assign({ locationId: areaId, type: 'area' }, params)).then(() => {
			this.module.charLog.logInfo(char, l10n.l('setAreaLocation.areaLocationSet', "Area location attribute was successfully set"));
		});
	}
}

export default SetAreaLocation;
