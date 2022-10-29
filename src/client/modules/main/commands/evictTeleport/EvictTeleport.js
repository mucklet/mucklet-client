import l10n from 'modapp-l10n';

/**
 * EvictTeleport adds the teleport type to the evict command.
 */
class EvictTeleport {
	constructor(app) {
		this.app = app;

		this.app.require([ 'evict', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.evict.addType({
			key: 'teleport',
			desc: l10n.l('evictTeleport.desc', `Evict from using current room as a teleport destination. <code class="param">Value</code> is omitted.`),
			value: (ctx, p) => this.evictTeleport(ctx.char, p.charId
				? { charId: p.charId }
				: { charName: p.charName }
			),
			examples: [{
				cmd: 'evict Jane Doe : teleport',
				desc: l10n.l('evictTeleport.exampleDesc', "Evicts Jane Doe from using current room as a teleport destination.")
			}],
			sortOrder: 20
		});
	}

	evictTeleport(char, params) {
		return char.call('evictTeleport', params).then(result => {
			let c = result.char;
			this.module.charLog.logInfo(char, l10n.l('evictTeleport.charEvicted', "Successfully evicted {charName} from teleporting to this room.", {
				charName: (c.name + " " + c.surname).trim()
			}));
		});
	}
}

export default EvictTeleport;
