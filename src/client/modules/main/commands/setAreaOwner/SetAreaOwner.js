import l10n from 'modapp-l10n';
import Err from 'classes/Err';

/**
 * SetAreaOwner adds the setArea attribute to set the area owner.
 */
class SetAreaOwner {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmdSteps', 'setArea', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.setArea.addAttribute({
			key: 'owner',
			stepFactory: () => this.module.cmdSteps.newAnyCharStep({
				name: "new owner",
				errRequired: step => new Err('setAreaOwner.characterRequired', "Who do you want to set as new owner?"),
				sortOrder: [ 'awake', 'watch', 'room' ],
			}),
			desc: l10n.l('setAreaOwner.ownerDesc', "Name of the new owner. To give ownership to another player's character, use the <code>request area owner</code> command instead."),
			value: (ctx, p) => this.setAreaOwner(ctx.char, p.charId
				? { charId: p.charId, areaId: p.areaId }
				: { charName: p.charName, areaId: p.areaId },
			),
			sortOrder: 100,
		});
	}

	setAreaOwner(char, params) {
		return char.call('setAreaOwner', params).then(result => {
			let c = result.newOwner;
			this.module.charLog.logInfo(char, l10n.l('setAreaOwner.areaOwnerSet', "Area owner was successfully set to {fullname}.", { fullname: (c.name + ' ' + c.surname).trim() }));
		});
	}
}

export default SetAreaOwner;
