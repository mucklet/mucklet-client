import { Elem, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import Err from 'classes/Err';
import formatDateTime from 'utils/formatDateTime';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'lookup <span class="param">Name</span>';
const shortDesc = 'Lookup characters by first name';
const helpText =
`<p>Lookup all characters with a given first name.</p>
<p><code class="param">Name</code> is the first name of the characters to lookup.</p>
<p>Example: <code>lookup John</code></p>`;

/**
 * Suspend adds the lookup command.
 */
class Suspend {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help', 'info', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addCmd({
			key: 'lookup',
			next: [
				new TextStep('name', {
					spanLines: false,
					regex: /^([\p{L}\p{N}'-]*)\s*/u,
					token: 'listitem',
					errRequired: step => new Err('lookup.nameRequired', "What is the first name of the characters to lookup?"),
				}),
			],
			value: (ctx, p) => this.lookup(ctx.char, { name: p.name }),
		});

		this.module.help.addTopic({
			id: 'lookup',
			category: 'basic',
			cmd: 'lookup',
			usage: l10n.l('lookup.usage', usageText),
			shortDesc: l10n.l('lookup.shortDesc', shortDesc),
			desc: l10n.l('lookup.helpText', helpText),
			sortOrder: 130,
		});
	}

	lookup(char, params) {
		return this.module.player.getPlayer().call('lookupChars', Object.assign({ extended: true }, params)).then(result => {
			let chars = [];

			result.chars.sort((a, b) => (b.lastAwake || 0) - (a.lastAwake || 0));
			for (let m of result.chars) {
				chars.push(
					'<tr>' +
					'<td class="charlog--cmd">' + escapeHtml(m.name + ' ' + m.surname) + '</td>' +
					'<td>' + (m.gender ? escapeHtml(m.gender) : '<span class="charlog--placeholder">' + escapeHtml(l10n.t('lookupChars.notSet', "Not set")) + '</span>') + '</td>' +
					'<td>' + (m.species ? escapeHtml(m.species) : '<span class="charlog--placeholder">' + escapeHtml(l10n.t('lookupChars.notSet', "Not set")) + '</span>') + '</td>' +
					'<td>' + escapeHtml(m.awake
						? l10n.t('lookup.awake', "Awake")
						: m.lastAwake
							? formatDateTime(new Date(m.lastAwake))
							: l10n.t('lookup.neverSeen', "Never seen")) + '</td>' +
					'</tr>',
				);
			}
			if (chars.length) {
				this.module.charLog.logComponent(char, 'lookupChars', new Elem(n => n.elem('div', { className: 'lookupchars charlog--pad' }, [
					n.elem('div', { className: 'charlog--code' }, [
						n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
							n.component(new Html('<tr><th class="charlog--strong">' +
								escapeHtml(l10n.t('lookupChars.name', "Name")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('lookupChars.gender', "Gender")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('lookupChars.species', "Species")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('lookupChars.lastSeen', "Last seen")) +
								'</th><th class="charlog--strong">' +
								'</th></tr>', { tagName: 'thead' },
							)),
							n.component(new Html(chars.join(''), { tagName: 'tbody' })),
						]),
					]),
				])));
			} else {
				this.module.charLog.logInfo(char, l10n.l('lookupChars.noCharsFound', "Found no characters with that name."));
			}
		});
	}
}

export default Suspend;
