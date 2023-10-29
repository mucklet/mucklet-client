import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import Err from 'classes/Err';
import formatText from 'utils/formatText';

const usageText = 'get note <span class="param">Character</span>';
const shortDesc = 'View any private notes for a character';
const helpText =
`<p>View any private notes for a character.</p>
<p><code class="param">Character</code> is the name of the character to view the notes for.</p>
<p>Alias: <code>get notes</code></p>`;

/**
 * GetNote views the get note command.
 */
class GetNote {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdSteps',
			'charLog',
			'help',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addPrefixCmd('get', {
			key: 'note',
			alias: [ 'notes' ],
			next: [
				this.module.cmdSteps.newAnyCharStep({
					errRequired: step => new Err('getNote.characterRequired', "Who do you want to view the notes for?"),
					sortOrder: [ 'awake', 'watch' ],
				}),
			],
			value: (ctx, p) => this.getNote(ctx.player, ctx.char, p.charId
				? { charId: p.charId, text: p.text }
				: { charName: p.charName, text: p.text },
			),
		});

		this.module.help.addTopic({
			id: 'getNote',
			category: 'friends',
			cmd: 'get note',
			alias: [ 'get notes' ],
			usage: l10n.l('getNote.usage', usageText),
			shortDesc: l10n.l('getNote.shortDesc', shortDesc),
			desc: l10n.l('getNote.helpText', helpText),
			sortOrder: 60,
		});
	}

	getNote(player, char, params) {
		let charName = "";
		return (params.charId
			? this.module.api.get('core.char.' + params.charId)
			: player.call('getChar', { charName: params.charName })
		).then(c => {
			charName = (c.name + " " + c.surname).trim();
			return this.module.api.get('note.player.' + player.id + '.note.' + c.id);
		}).then(note => {
			if (note.text.trim() == "") {
				return Promise.reject({ code: 'system.notFound' });
			}
			this.module.charLog.logComponent(char, 'getNote', new Elem(n => n.elem('div', { className: 'getnote charlog--pad' }, [
				n.component(new Txt(l10n.l('getNote.notesFor', "Notes for {charName}", { charName }), { tagName: 'h4', className: 'charlog--pad' })),
				n.component(new Html(formatText(note.text), { tagName: 'span', className: 'common--formattext charlog--font-small' })),
			])));
		}).catch(err => {
			if (err.code == 'system.notFound') {
				this.module.charLog.logInfo(char, l10n.l('getNote.noNotesFor', "No notes for {charName}.", { charName }));
			} else {
				return Promise.reject(err);
			}
		});
	}
}

export default GetNote;
