import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import ValueStep from 'classes/ValueStep';
import MultiDelimStep from 'classes/MultiDelimStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'address <span class="opt"><span class="param">Character</span></span> =<span class="opt">&gt;</span><span class="opt">:</span> <span class="param">Message</span>';
const shortDesc = 'Address a character in the room';
const helpText =
`<p>Address a character, but let everyone else in the room hear it.<br>
If the message starts with <code>&gt;</code> (greater than), the message will be marked as out of character (OOC).<br>
If the message starts with <code>:</code> (colon), the message will be treated in the same way as a <code>pose</code> action rather than something being said.</p>
<p><code class="param">Character</code> is the name of the character being addressed. It defaults to the character last addressed.</p>
<p><code class="param">Message</code> is the message to the addressed. It may be formatted and span multiple paragraphs.</p>
<p>Alias: <code>@</code>, <code>to</code></p>`;

/**
 * Address adds the address command.
 */
class Address {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addCmd({
			key: 'address',
			next: [
				new ListStep('charId', this.module.cmdLists.getInRoomChars(), {
					name: "character",
					errRequired: null,
				}),
				new DelimStep("=", {
					next: [
						new MultiDelimStep({
							">": { next: new ValueStep('ooc', true), errRequired: null },
							":": { next: new ValueStep('pose', true), errRequired: null },
						}),
						new TextStep('msg', {
							spanLines: true,
							errRequired: step => ({ code: 'address.messageRequired', message: "What do you want to communicate?" }),
							maxLength: () => this.module.info.getCore().communicationMaxLength,
							errTooLong: communicationTooLong,
							completer: this.module.cmdLists.getInRoomChars()
						})
					]
				})
			],
			symbol: '@',
			alias: [ 'to' ],
			value: (ctx, p) => this.address(ctx.char, { charId: p.charId, msg: p.msg, pose: p.pose, ooc: p.ooc })
		});

		this.module.help.addTopic({
			id: 'address',
			category: 'communicate',
			cmd: 'address',
			alias: [ '@', 'to' ],
			usage: l10n.l('address.usage', usageText),
			shortDesc: l10n.l('address.shortDesc', shortDesc),
			desc: l10n.l('address.helpText', helpText),
			sortOrder: 50,
		});
	}

	address(char, params) {
		// If we are missing target charId, we fetch the last one targeted.
		let charId = params.charId;
		if (!charId) {
			charId = this.lastCharId[char.id];
			if (!charId) {
				return Promise.reject({ code: 'address.noCharacter', message: "Who do you want to address?" });
			}
			params.charId = charId;
		} else {
			this.lastCharId[char.id] = charId;
		}
		return char.call('address', params);
	}
}

export default Address;
