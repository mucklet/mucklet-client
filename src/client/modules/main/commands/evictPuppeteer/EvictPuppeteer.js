import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';

/**
 * EvictPuppeteer adds the puppeteer type to the evict command.
 */
class EvictPuppeteer {
	constructor(app) {
		this.app = app;

		this.app.require([
			'evict',
			'charLog',
			'cmdSteps',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.evict.addType({
			key: 'puppeteer',
			desc: l10n.l('evictPuppeteer.desc', `Evict from using a puppet. <code class="param">Value</code> is the name of the puppet.`),
			next: [
				new DelimStep("=", { errRequired: null }),
				this.module.cmdSteps.newAnyCharStep({
					id: 'puppetId',
					textId: 'puppetName',
					name: "puppet",
					errRequired: step => ({ code: 'evictPuppeteer.puppetRequired', message: "What puppet do you want to evict from?" }),
				}),
			],
			value: (ctx, p) => this.evictPuppeteer(ctx.char, Object.assign(
				p.charId ? { charId: p.charId } : { charName: p.charName },
				p.puppetId ? { puppetId: p.puppetId } : { puppetName: p.puppetName },
			)),
			examples: [{
				cmd: 'evict John Doe : puppeteer = Jane Puppet',
				desc: l10n.l('evictPuppeteer.exampleDesc', "Evicts Jane Doe from using current Jane Puppet as a puppet."),
			}],
			sortOrder: 30,
		});
	}

	evictPuppeteer(char, params) {
		return char.call('evictPuppeteer', params).then(result => {
			let c = result.char;
			let p = result.puppet;
			this.module.charLog.logInfo(char, l10n.l('evictPuppeteer.charEvicted', "Successfully evicted {charName} from using {puppetName} as a puppet.", {
				charName: (c.name + " " + c.surname).trim(),
				puppetName: (p.name + " " + p.surname).trim(),
			}));
		});
	}
}

export default EvictPuppeteer;
