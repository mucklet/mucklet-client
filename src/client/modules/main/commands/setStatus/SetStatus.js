import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import { propertyTooLong } from 'utils/cmdErr';

const usageText = 'status <span class="opt"><span class="opt">=</span> <span class="param">Status</span></span>';
const shortDesc = `Set or clear status message`;
const helpText =
`<p>Set or clear status message.</p>
<p><code class="param">Status</code> is the optional status message. If omitted, the current status is cleared.</p>
<p>Alias: <code>set status</code></p>`;

const txtStatusSet = l10n.l('setStatus.statusSet', "Status message set.");
const txtStatusCleared = l10n.l('setStatus.statusCleared', "Status message cleared.");

/**
 * SetStatus adds the set status command.
 */
class SetStatus {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'help', 'charLog', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addPrefixCmd('set', {
			key: 'status',
			next: [
				new DelimStep("=", { errRequired: null }),
				new TextStep('status', {
					spanLines: false,
					maxLength: () => module.info.getCore().propertyMaxLength,
					errTooLong: propertyTooLong,
					errRequired: null,
				}),
			],
			value: (ctx, p) => this.status(ctx.char, { status: p.status ? p.status.trim() : '' }),
		});
		this.module.cmd.addCmd({
			key: 'status',
			next: [
				new DelimStep("=", { errRequired: null }),
				new TextStep('status', {
					spanLines: false,
					maxLength: () => module.info.getCore().propertyMaxLength,
					errTooLong: propertyTooLong,
					errRequired: null,
				}),
			],
			value: (ctx, p) => this.status(ctx.char, { status: p.status ? p.status.trim() : '' }),
		});

		this.module.help.addTopic({
			id: 'status',
			category: 'basic',
			cmd: 'status',
			usage: l10n.l('setStatus.usage', usageText),
			shortDesc: l10n.l('setStatus.shortDesc', shortDesc),
			desc: l10n.l('setStatus.helpText', helpText),
			sortOrder: 100,
		});
	}

	status(char, params) {
		return char.call('set', params).then(() => {
			this.module.charLog.logInfo(char, params.status
				? txtStatusSet
				: txtStatusCleared,
			);
	   });
	}
}

export default SetStatus;
