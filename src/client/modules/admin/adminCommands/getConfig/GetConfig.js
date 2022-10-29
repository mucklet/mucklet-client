import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const usageText = 'get config';
const shortDesc = 'Get world configuration in JSON format';
const helpText =
`<p>Get world configuration in JSON format.</p>`;


/**
 * Getconfig gets world config.
 */
class Getconfig {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'api', 'helpAdmin' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('get', {
			key: 'config',
			value: (ctx, p) => this._getconfig(ctx)
		});

		this.module.helpAdmin.addTopic({
			id: 'getconfig',
			cmd: 'get config',
			usage: l10n.l('getconfig.usage', usageText),
			shortDesc: l10n.l('getconfig.shortDesc', shortDesc),
			desc: l10n.l('getconfig.helpText', helpText),
			sortOrder: 5,
		});
	}

	_getconfig(ctx) {
		this.module.api.call('core', 'getConfig').then(result => {
			this.module.charLog.logComponent(ctx.char, 'getconfig', new Elem(n => n.elem('div', { className: 'charlog--pad' }, [
				n.component(new Txt(l10n.l('getconfig.worldConfig', "World configuration"), { tagName: 'h4' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('pre', { className: 'common--pre-wrap' }, [ n.text(JSON.stringify(result, null, 4)) ])
				])
			])));
		});
	}
}

export default Getconfig;
