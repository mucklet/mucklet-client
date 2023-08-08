import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'describe <span class="param">Description</span>';
const shortDesc = 'Describe an event for others in the room';
const helpText =
`<p>Send a description to the all characters in the room. Unlike <code>say</code>, a description will not be prefixed by the character's name, and is used to describe events not directly tied to the character.</p>
<p><code class="param">Description</code> is the event description. It may be formatted and span multiple paragraphs.</p>
<p>Alias: <code>desc</code>, <code>spoof</code></p>`;

/**
 * Describe adds the describe command.
 */
class Describe {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'describe',
			next: new TextStep('msg', {
				spanLines: true,
				errRequired: step => ({ code: 'describe.messageRequired', message: "What do you wish to describe?" }),
				maxLength: () => this.module.info.getCore().communicationMaxLength,
				errTooLong: communicationTooLong,
				completer: this.module.cmdLists.getInRoomChars(),
				formatText: true,
			}),
			alias: [ 'desc', 'spoof' ],
			value: (ctx, p) => this.describe(ctx.char, { msg: p.msg }),
		});

		this.module.help.addTopic({
			id: 'describe',
			category: 'communicate',
			cmd: 'describe',
			alias: [ 'desc', 'spoof' ],
			usage: l10n.l('describe.usage', usageText),
			shortDesc: l10n.l('describe.shortDesc', shortDesc),
			desc: l10n.l('describe.helpText', helpText),
			sortOrder: 60,
		});
	}

	describe(char, params) {
		return char.call('describe', params);
	}
}

export default Describe;
