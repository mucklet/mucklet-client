import l10n from 'modapp-l10n';
import NumberStep from 'classes/NumberStep';
import * as translateErr from 'utils/translateErr';

/**
 * SetExitOrder adds command to set exit attributes.
 */
class SetExitOrder {
	constructor(app) {
		this.app = app;

		this.app.require([ 'setExit', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.setExit.addAttribute({
			key: 'order',
			stepFactory: () => new NumberStep('order', { name: "exit order position" }),
			desc: l10n.l('setExitOrder.orderDesc', "Order position of the exit, starting with 1."),
			value: (ctx, p) => this.setExitOrder(ctx.char, p.exitId
				? { exitId: p.exitId, order: p.order - 1 }
				: { exitKey: p.exitKey, order: p.order - 1 },
			),
			sortOrder: 100,
		});
	}

	setExitOrder(char, params) {
		return char.call('setExitOrder', params).then(result => {
			this.module.charLog.logInfo(char, l10n.l('setExitOrder.exitOrderSet', "Exit order was successfully set."));
		}).catch(err => {
			throw translateErr.exitNotFound(err, params.exitKey);
		});
	}
}

export default SetExitOrder;
