import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';

const usageText = 'add note <span class="param">Character</span> = <span class="param">Note</span>';
const shortDesc = 'Add a private note for any character';
const helpText =
`<p>Add a private note for any character. If other notes exist for that character, the note will be appended on a new line.</p>
<p><code class="param">Character</code> is the name of the character to add a note for.</p>
<p><code class="param">Note</code> is the note text. It may be formatted and span multiple paragraphs.</p>`;

/**
 * AddNote adds the add note command.
 */
class AddNote {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'cmdSteps',
			'charLog',
			'help',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addPrefixCmd('add', {
			key: 'note',
			next: [
				this.module.cmdSteps.newAnyCharStep({
					errRequired: step => ({ code: 'addNote.characterRequired', message: "Who do you want to add a note for?" }),
				}),
				new DelimStep("=", {
					next: [
						new TextStep('text', {
							spanLines: true,
							errRequired: step => ({ code: 'addNote.noteRequired', message: "What is the note you want to add?" }),
							completer: this.module.cmdLists.getAllChars(),
							formatText: true,
						}),
					],
				}),
			],
			value: (ctx, p) => this.addNote(ctx.player, ctx.char, p.charId
				? { charId: p.charId, text: p.text }
				: { charName: p.charName, text: p.text },
			),
		});

		this.module.help.addTopic({
			id: 'addNote',
			category: 'friends',
			cmd: 'add note',
			usage: l10n.l('addNote.usage', usageText),
			shortDesc: l10n.l('addNote.shortDesc', shortDesc),
			desc: l10n.l('addNote.helpText', helpText),
			sortOrder: 50,
		});
	}

	addNote(player, char, params) {
		return (params.charId
			? Promise.resolve({ id: params.charId })
			: player.call('getChar', { charName: params.charName })
		).then(c => this.module.api.call('note.player.' + player.id + '.note.' + c.id, 'append', {
			text: params.text,
		})).then(result => {
			let c = result.char;
			this.module.charLog.logInfo(char, l10n.l('addNote.addedNoteFor', "Added a note for {charName}.", { charName: (c.name + " " + c.surname).trim() }));
		});
	}
}

export default AddNote;
