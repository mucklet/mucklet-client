import l10n from 'modapp-l10n';
import Err from 'classes/Err';

const usageText = 'delete note <span class="param">Character</span>';
const shortDesc = 'Delete any private notes for a character';
const helpText =
`<p>Delete any private notes for a character.</p>
<p><code class="param">Character</code> is the name of the character to delete the notes for.</p>
<p>Alias: <code>delete notes</code></p>`;

/**
 * DeleteNote deletes the delete note command.
 */
class DeleteNote {
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

		this.module.cmd.addPrefixCmd('delete', {
			key: 'note',
			alias: [ 'notes' ],
			next: [
				this.module.cmdSteps.newAnyCharStep({
					errRequired: step => new Err('deleteNote.characterRequired', "Who do you want to delete the notes for?"),
					sortOrder: [ 'awake', 'watch' ],
				}),
			],
			value: (ctx, p) => this.deleteNote(ctx.player, ctx.char, p.charId
				? { charId: p.charId, text: p.text }
				: { charName: p.charName, text: p.text },
			),
		});

		this.module.help.addTopic({
			id: 'deleteNote',
			category: 'friends',
			cmd: 'delete note',
			alias: [ 'delete notes' ],
			usage: l10n.l('deleteNote.usage', usageText),
			shortDesc: l10n.l('deleteNote.shortDesc', shortDesc),
			desc: l10n.l('deleteNote.helpText', helpText),
			sortOrder: 70,
		});
	}

	deleteNote(player, char, params) {
		return (params.charId
			? Promise.resolve({ id: params.charId })
			: player.call('getChar', { charName: params.charName })
		).then(c => this.module.api.call('note.player.' + player.id + '.note.' + c.id, 'delete')).then(result => {
			let c = result.char;
			this.module.charLog.logInfo(char, l10n.l('deleteNote.deletedNoteFor', "Deleted notes for {charName}.", { charName: (c.name + " " + c.surname).trim() }));
		});
	}
}

export default DeleteNote;
