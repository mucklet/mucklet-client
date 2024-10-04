import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';

/**
 * ToolPageCharNote adds the note tool to PageChar footer.
 */
class ToolPageCharNote {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'pageChar',
			'player',
			'dialogReport',
			'dialogEditNote',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		// Add logout tool
		this.module.pageChar.addTool({
			id: 'note',
			type: 'footer',
			sortOrder: 10,
			componentFactory: (ctrl, char) => new Elem(n => n.elem('button', {
				className: 'btn tiny tinyicon',
				events: {
					click: () => this.module.dialogEditNote.open(char.id),
				},
			}, [
				n.component(new FAIcon('file-text')),
				n.component(new Txt(l10n.l('toolPageCharNote.note', "Note"))),
			])),
			filter: (ctrl, char) => !this.module.player.ownsChar(char.id),
		});

	}

	/**
	 * Reports a character profile for char, using your controlled character,
	 * ctrl, as noteer.
	 * @param {Model} ctrl Controlled character making the note.
	 * @param {Model} char Charater whose profile to note.
	 */
	note(ctrl, char) {
		this.module.api.get('core.char.' + char.id).catch((err) => {
			console.error("Error getting char: ", err);
			return char;
		}).then(c => {
			this.module.dialogReport.open(ctrl.id, c.id, c.puppeteer?.id, {
				attachProfile: true,
			});
		});
	}

	dispose() {
		this.module.pageChar.addTool('note');
	}
}

export default ToolPageCharNote;
