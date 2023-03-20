import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import IDStep from 'classes/IDStep';
import DelimStep from 'classes/DelimStep';
import getObjectProperty from 'utils/getObjectProperty';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'compare <span class="param">Character<span class="comment">/</span>#Character ID</span> = <span class="param">Compare Character<span class="comment">/</span>#Compare Character ID</span>';
const shortDesc = 'Compare two characters to see if their players match';
const helpText =
`<p>Compare a reported character with another character to see if their players match by account, email address, or IPs used.</p>
<p>If a report doesn't exist for the character, one will be created and assigned to you.</p>
<p><code class="param">Character</code> is the name of the reported characters.</p>
<p><code class="param">#Character ID</code> is the ID of the reported character.</p>
<p><code class="param">Compare Character</code> is the name of the character to compare with.</p>
<p><code class="param">#Compare Character ID</code> is the ID of the character to compare with.</p>
<p>Example: <code>compare Jane Doe = John Doe</code></p>`;

let matchFlags = [
	{ key: 'userMatch', text: l10n.l('compare.samePlayer', "Same player.") },
	{ key: 'emailMatch', text: l10n.l('compare.sameEmail', "Same email address.") },
	{ key: 'ipMatch', text: l10n.l('compare.matchingIp', "Matching IP.") },
];

const txtNoMatch = l10n.l('compare.noPlayerMatch', "No player match.");

/**
 * Compare adds the compare command.
 */
class Compare {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'cmdSteps', 'helpModerate', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addCmd({
			key: 'compare',
			next: [
				new IDStep('charId', {
					name: "character name or ID",
					else: this.module.cmdSteps.newAnyCharStep(),
				}),
				new DelimStep("=", {
					next: [
						new IDStep('compareCharId', {
							name: "compare character name or ID",
							else: this.module.cmdSteps.newAnyCharStep({
								id: 'compareCharId',
								textId: 'compareCharName',
								name: "compare character",
								errRequired: step => ({ code: 'compare.compateCharacterRequired', message: "Which character to compare with?" }),
							}),
						}),
					],
				}),
			],
			value: (ctx, p) => this._compare(ctx, p),
		});

		this.module.helpModerate.addTopic({
			id: 'compare',
			cmd: 'compare',
			usage: l10n.l('compare.usage', usageText),
			shortDesc: l10n.l('compare.shortDesc', shortDesc),
			desc: l10n.l('compare.helpText', helpText),
			sortOrder: 220,
		});
	}

	_compare(ctx, params) {
		return ctx.player.call('compare', Object.assign(getObjectProperty(params, 'charId', 'charName'), getObjectProperty(params, 'compareCharId', 'compareCharName'))).then(result => {
			try {

				let matches = [];
				for (let o of matchFlags) {
					if (result[o.key]) {
						matches.push(l10n.t(o.text));
					}
				}

				let c = result.char;
				let cc = result.compareChar;
				let rows = [
					[ "Character", escapeHtml((c.name + ' ' + c.surname).trim(), { className: 'charlog--strong' }) ],
					[ "Compared with", escapeHtml((cc.name + ' ' + cc.surname).trim(), { className: 'charlog--strong' }) ],
					[ "Match", matches.length ? escapeHtml(matches.join(" ")) : txtNoMatch ],
				];

				let elem = new Elem(n => {
					return n.elem('div', { className: 'charlog--pad' }, [
						n.elem('div', { className: 'charlog--code' }, [
							n.component(new Txt(l10n.l('compare.comparison', "Comparison result"), { tagName: 'h4' })),
							n.elem('table', { className: 'tbl-small tbl-nomargin charlog--font-small' }, rows.filter(m => !m[2] || !m[2].hide).map(m => n.elem('tr', [
								n.elem('td', { className: 'charlog--strong' }, [
									n.component(new Txt(m[0])),
								]),
								n.elem('td', [
									n.component(new Html(m[1], { className: m[2] && m[2].className })),
								]),
							]))),
						]),
					]);
				});

				this.module.charLog.logComponent(ctx.char, 'compare', elem);
			} catch (ex) {
				console.log(ex);
			}
		});
	}
}

export default Compare;
