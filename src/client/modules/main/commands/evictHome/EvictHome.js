import l10n from 'modapp-l10n';

/**
 * EvictHome adds the home type to the evict command.
 */
class EvictHome {
	constructor(app) {
		this.app = app;

		this.app.require([ 'evict', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.evict.addType({
			key: 'home',
			desc: l10n.l('evictHome.desc', `Evict from current room, setting their home back to default. <code class="param">Value</code> is omitted.`),
			value: (ctx, p) => this.evictHome(ctx.char, p.charId
				? { charId: p.charId }
				: { charName: p.charName }
			),
			examples: [{
				cmd: 'evict John Doe : home',
				desc: l10n.l('evictHome.exampleDesc', "Evicts John Doe from using current room as home.")
			}],
			sortOrder: 10
		});
	}

	evictHome(char, params) {
		return char.call('evictHome', params).then(result => {
			let c = result.char;
			this.module.charLog.logInfo(char, l10n.l('evictHome.charEvicted', "Successfully evicted {charName} from this room.", {
				charName: (c.name + " " + c.surname).trim()
			}));
		});
	}
}

export default EvictHome;
