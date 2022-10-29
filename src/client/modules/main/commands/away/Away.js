import { Txt, Elem } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import ValueStep from 'classes/ValueStep';
import DelimStep from 'classes/DelimStep';
import { propertyTooLong } from 'utils/cmdErr';

const usageText = 'away <span class="opt"><span class="opt">=</span> <span class="param">Status</span></span>';
const shortDesc = `Set the idle status as being away`;
const helpText =
`<p>Set idle state to <em>away</em> with an optional status message.</p>
<p><code class="param">Status</code> is the optional status message.</p>
<p>Alias: <code>afk</code></p>`;

const txtSetAsAway = l10n.l('away.setAsAway', "Set as away.");
const setAsAwayClearStatus = l10n.l('away.setAsAwayClearStatus', "Set as away. To clear the status message, type:");

/**
 * Away adds the away command.
 */
class Away {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'help', 'charLog', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'away',
			next: [
				new DelimStep("=", { next: new ValueStep('withStatus', true), errRequired: null }),
				new TextStep('status', {
					spanLines: false,
					maxLength: () => module.info.getCore().propertyMaxLength,
					errTooLong: propertyTooLong,
					errRequired: null
				})
			],
			alias: [ 'afk' ],
			value: (ctx, p) => this.away(ctx.char, { status: p.withStatus ? (p.status || '') : (p.status || null) })
		});

		this.module.help.addTopic({
			id: 'away',
			category: 'basic',
			cmd: 'away',
			alias: [ 'afk' ],
			usage: l10n.l('away.usage', usageText),
			shortDesc: l10n.l('away.shortDesc', shortDesc),
			desc: l10n.l('away.helpText', helpText),
			sortOrder: 90,
		});
	}

	away(char, params) {
		return char.call('away', params).then(() => {
			if (params.status) {
				this.module.charLog.logComponent(char, 'info', new Elem(n => n.elem('div', [
					n.component(new Txt(setAsAwayClearStatus)),
					n.elem('div', { className: 'charlog--pad-small' }, [
						n.elem('div', { className: 'charlog--code' }, [
							n.elem('code', [ n.text("status") ])
						])
					])
				])));
			} else {
				this.module.charLog.logInfo(char, txtSetAsAway);
			}
	   });
	}
}

export default Away;
