import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import formatDateTime from 'utils/formatDateTime';
import getObjectProperty from 'utils/getObjectProperty';
import escapeHtml from 'utils/escapeHtml';
import * as banReasons from 'utils/banReasons';


const usageText = 'inspect <span class="param">Character<span class="comment">/</span>#Character ID</span>';
const shortDesc = 'Get moderation information about a character';
const helpText =
`<p>Get moderation information about a character and its player.</p>
<p><code class="param">Character</code> is the name of any of the characters to inspect.</p>
<p><code class="param">#CharacterID</code> is the ID of the character.</p>
<p>Example: <code>inspect Jane Doe</code></p>`;

let trustFlags = {
	T: l10n.l('inspect.trusted', "Trusted"),
	V: l10n.l('inspect.trusted', "Uses VPN"),
	B: l10n.l('inspect.trusted', "Matched banned IP"),
};

const txtNoTrustFlags = l10n.l('inspect.noTrustFlags', "No flags");
const txtNoAssociatedChar = l10n.l('inspect.noAssociatedChar', "<em>No associated char</em>");

/**
 * Inspect adds the inspect command.
 */
class Inspect {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'cmdLists', 'helpModerate', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addCmd({
			key: 'inspect',
			next: [
				new IDStep('charId', {
					name: "character name or ID",
					else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
						textId: 'charName',
						name: "character",
						errRequired: step => ({ code: 'inspect.characterRequired', message: "Which character?" }),
					}),
				}),
			],
			value: (ctx, p) => this._inspect(ctx, getObjectProperty(p, 'charId', 'charName')),
		});

		this.module.helpModerate.addTopic({
			id: 'inspect',
			cmd: 'inspect',
			usage: l10n.l('inspect.usage', usageText),
			shortDesc: l10n.l('inspect.shortDesc', shortDesc),
			desc: l10n.l('inspect.helpText', helpText),
			sortOrder: 220,
		});
	}

	_formatTrust(t) {
		if (!t) return txtNoTrustFlags;

		let a = [];
		t = t.toUpperCase();
		for (let f in trustFlags) {
			if (t.indexOf(f) >= 0) {
				a.push(l10n.t(trustFlags[f]));
			}
		}
		return a.length ? a.join(", ") : txtNoTrustFlags;
	}

	_inspect(ctx, p) {
		return ctx.player.call('inspectChar', p).then(result => {
			try {

				let c = result.char;
				let rows = [
					[ "Character", escapeHtml((c.name + ' ' + c.surname).trim(), { className: 'charlog--strong' }) ],
					[ "Player joined", result.playerJoined ],
					[ "Character created", result.charCreated ],
					[ "Banned", result.banned && escapeHtml(formatDateTime(new Date(result.banned), { showYear: true })), { hide: !result.banned }],
					[ "Flags", this._formatTrust(result.trust) ],
				];

				let elem = new Elem(n => {

					let content = [
						n.component(new Txt(l10n.l('inspect.inspectionResult', "Inspection result"), { tagName: 'h4' })),
						n.elem('table', { className: 'tbl-small tbl-nomargin charlog--font-small' }, rows.filter(m => !m[2] || !m[2].hide).map(m => n.elem('tr', [
							n.elem('td', { className: 'charlog--strong' }, [
								n.component(new Txt(m[0])),
							]),
							n.elem('td', [
								n.component(new Txt(m[1], { className: m[2] && m[2].className })),
							]),
						]))),
					];
					if (result.banMatches && result.banMatches.length) {
						content.push(n.component(new Txt(l10n.l('inspect.matchingBannedIPs', "Matching IP of banned players"), { tagName: 'h4', className: 'charlog--pad' })));
						content.push(n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
							n.component(new Html('<tr>' +
								'<th class="charlog--strong">' + escapeHtml(l10n.t('inspect.character', "Associated character")) + '</th>' +
								'<th class="charlog--strong">' + escapeHtml(l10n.t('inspect.banned', "Banned")) + '</th>' +
								'<th class="charlog--strong">' + escapeHtml(l10n.t('inspect.reason', "Reason")) + '</th>' +
								'</tr>', { tagName: 'thead' },
							)),
							n.component(new Html(result.banMatches.map(m => '<tr>' +
								'<td>' + (m.char ? escapeHtml(m.char.name + ' ' + m.char.surname) : l10n.t(txtNoAssociatedChar)) + '</td>' +
								'<td>' + escapeHtml(formatDateTime(new Date(m.banned), { showYear: true })) + '</td>' +
								'<td>' + escapeHtml(l10n.t(banReasons.toLocaleString(m.banReason))) + '</td>' +
								'</tr>',
							).join(''), { tagName: 'tbody' })),
						]));
					}

					return n.elem('div', { className: 'charlog--pad' }, [
						n.elem('div', { className: 'charlog--code' }, content),
					]);
				});

				this.module.charLog.logComponent(ctx.char, 'inspect', elem);
			} catch (ex) {
				console.log(ex);
			}
		});
	}
}

export default Inspect;
