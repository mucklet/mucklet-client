import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import ValueStep from 'classes/ValueStep';
import { descriptionTooLong } from 'utils/cmdErr';

const usageText = 'lfrp <span class="opt">= <span class="param">Description</span></span>';
const shortDesc = 'Look for roleplay';
const helpText =
`<p>Set your character as looking for roleplay. Use the description for in character roleplay setup, out of character info on what type of roleplay you seek, or directions on where to find you.</p>
<p>Use <code>stop lfrp</code> to stop looking for roleplay.</p>
<p><code class="param">Description</code> of the roleplay you are looking for. It may be formatted and span multiple paragraphs. If omitted, previous description will be used.</p>`;
const examples = [
	{ cmd: 'lfrp', desc: l10n.l('lfrp.lfrpDesc', "Starting to look for roleplay") },
	{ cmd: 'lfrp = Having a drink by the bar. ((`message` me for directions))', desc: l10n.l('lfrp.lfrpWithDescDesc', "Starting to look for roleplay with new description") },
	{ cmd: 'stop lfrp', desc: l10n.l('lfrp.stopLfrpDesc', "Stop looking for roleplay") },
];

const txtSetAsLfrp = l10n.l('lfrp.setAsLookingForRoleplay', "Set as looking for roleplay.");

/**
 * Lfrp adds the lfrp (looking for roleplay) command.
 */
class Lfrp {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'help',
			'info',
			'charLog',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'lfrp',
			next: [
				new DelimStep("=", { next: new ValueStep('withDesc', true), errRequired: null }),
				new TextStep('description', {
					spanLines: true,
					maxLength: () => module.info.getCore().descriptionMaxLength,
					errTooLong: descriptionTooLong,
					completer: this.module.cmdLists.getAllChars({
						filterMuted: true,
						sortOrder: [ 'watch', 'awake', 'room' ],
					}),
					errRequired: null,
					formatText: true,
				}),
			],
			value: (ctx, p) => this.lfrp(ctx.char, p.withDesc || p.description
				? { lfrpDesc: p.description || '' }
				: null,
			),
		});

		this.module.help.addTopic({
			id: 'lfrp',
			category: 'basic',
			cmd: 'lfrp',
			usage: l10n.l('lfrp.usage', usageText),
			shortDesc: l10n.l('lfrp.shortDesc', shortDesc),
			desc: l10n.l('lfrp.helpText', helpText),
			examples,
			sortOrder: 110,
		});
	}

	/**
	 * Set character as looking for group
	 * @param {*} char Controlled character model.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.lfrpDesc] Description of the roleplay you are looking for.
	 * @returns {Promise}
	 */
	lfrp(char, opt) {
		// First we set LFRP description, then we set rp state.
		return Promise.resolve(typeof opt?.lfrpDesc == 'string'
			? this.module.player.getPlayer().call('setCharSettings', {
				charId: char.id,
				puppeteerId: char.puppeteer?.id || undefined,
				lfrpDesc: opt.lfrpDesc,
			})
			: null,
		)
			.then(() => char.call('set', { rp: 'lfrp' }))
			.then(() => {
				this.module.charLog.logInfo(char, txtSetAsLfrp);
			});
	}
}

export default Lfrp;
