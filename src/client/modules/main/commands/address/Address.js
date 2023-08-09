import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import ValueStep from 'classes/ValueStep';
import RepeatStep from 'classes/RepeatStep';
import MultiDelimStep from 'classes/MultiDelimStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'address <span class="opt"><span class="param">Character</span> <span class="opt">, <span class="param">Character</span></span><span class="comment">...</span></span> =<span class="opt">&gt;</span><span class="opt">:</span> <span class="param">Message</span>';
const shortDesc = 'Address characters in the room';
const helpText =
`<p>Address one or more characters, but let everyone else in the room hear it.<br>
If the message starts with <code>&gt;</code> (greater than), the message will be marked as out of character (OOC).<br>
If the message starts with <code>:</code> (colon), the message will be treated in the same way as a <code>pose</code> action rather than something being said.</p>
<p><code class="param">Character</code> is the name of the character being addressed. If omitted, it defaults to the character(s) last addressed.</p>
<p><code class="param">Message</code> is the message to the addressed. It may be formatted and span multiple paragraphs.</p>
<p>Alias: <code>@</code>, <code>to</code></p>`;
const examples = [
	{ cmd: 'address Jane Doe = Welcome!', desc: l10n.l('address.addressSingleDesc', "Addresses Jane Doe") },
	{ cmd: '@John => Nice profile pic.', desc: l10n.l('address.whispeOocDesc', "Addresses John out of character") },
	{ cmd: 'to John, Jane =>: is new here.', desc: l10n.l('address.addressOocPoseMultipleDesc', "Addresses John and Jane with an out of character pose") },
	{ cmd: 'to =: returns the hug.', desc: l10n.l('address.addressPoseLastDesc', "Addresses the last character(s) addressed with a pose") },
];

/**
 * Address adds the address command.
 */
class Address {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'cmdSteps',
			'help',
			'info',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharIds = {};

		this.module.cmd.addCmd({
			key: 'address',
			next: [
				new RepeatStep(
					'chars',
					(next, idx) => this.module.cmdSteps.newInRoomCharStep({
						id: 'charId-' + idx,
						errRequired: null,
						next,
					}),
					{
						delimiter: ",",
					},
				),
				new DelimStep("=", {
					next: [
						new MultiDelimStep({
							">": { next: new ValueStep('ooc', true), errRequired: null },
							":": { next: new ValueStep('pose', true), errRequired: null },
						}),
						new TextStep('msg', {
							spanLines: true,
							token: state => state.getParam('ooc') ? 'ooc' : 'text',
							errRequired: step => ({ code: 'address.messageRequired', message: "What do you want to communicate?" }),
							maxLength: () => this.module.info.getCore().communicationMaxLength,
							errTooLong: communicationTooLong,
							completer: this.module.cmdLists.getInRoomChars(),
							formatText: true,
						}),
					],
				}),
			],
			symbol: '@',
			alias: [ 'to' ],
			value: (ctx, p) => {
				let charIds = [];
				let i = 0;
				while (p['charId-' + i]) {
					charIds.push(p['charId-' + i]);
					i++;
				}
				return this.address(ctx.char, { charIds, msg: p.msg, pose: p.pose, ooc: p.ooc });
			},
		});

		this.module.help.addTopic({
			id: 'address',
			category: 'communicate',
			cmd: 'address',
			alias: [ '@', 'to' ],
			usage: l10n.l('address.usage', usageText),
			shortDesc: l10n.l('address.shortDesc', shortDesc),
			desc: l10n.l('address.helpText', helpText),
			examples,
			sortOrder: 50,
		});
	}

	address(char, params) {
		// If we are missing target charIds, we fetch the last ones targeted.
		let charIds = params.charIds || [];
		if (!charIds.length) {
			charIds = this.lastCharIds[char.id];
			if (!charIds) {
				return Promise.reject({ code: 'address.noCharacter', message: "Who do you want to address?" });
			}
			params.charIds = charIds;
		} else {
			this.lastCharIds[char.id] = charIds;
		}
		return char.call('address', params);
	}
}

export default Address;
