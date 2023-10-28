import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import MultiDelimStep from 'classes/MultiDelimStep';
import ValueStep from 'classes/ValueStep';
import RepeatStep from 'classes/RepeatStep';
import Err from 'classes/Err';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'message <span class="opt"><span class="param">Character</span> <span class="opt">, <span class="param">Character</span></span><span class="comment">...</span></span> =<span class="opt">&gt;</span><span class="opt">:</span> <span class="param">Message</span>';
const shortDesc = 'Send a message to awake characters';
const helpText =
`<p>Send a message to one or more awake characters in the realm.<br>
If the message starts with <code>&gt;</code> (greater than), the message will be marked as out of character (OOC).<br>
If the message starts with <code>:</code> (colon), the message will be treated in the same way as a <code>pose</code> action rather than something being texted.</p>
<p><code class="param">Character</code> is the name of the character to message. If omitted, it defaults to the character(s) last messaged.</p>
<p><code class="param">Message</code> is the messaged text. It may be formatted and span multiple paragraphs.</p>
<p>Alias: <code>m</code>, <code>msg</code>, <code>p</code>, <code>page</code></p>`;
const examples = [
	{ cmd: 'message Jane Doe = Long time no see!', desc: l10n.l('message.messageSingleDesc', "Messages Jane Doe") },
	{ cmd: 'msg John => Are you busy?', desc: l10n.l('message.whispeOocDesc', "Messages John out of character") },
	{ cmd: 'm John, Jane =>: is no longer AFK.', desc: l10n.l('message.messageOocPoseMultipleDesc', "Messages John and Jane with an out of character pose") },
	{ cmd: 'page =: sends a thumbs up.', desc: l10n.l('message.messagePoseLastDesc', "Messages the last character(s) messaged with a pose") },
];

/**
 * Message adds the message command.
 */
class Message {
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

		let charListOpt = {
			filterMuted: true,
			sortOrder: [ 'watch', 'room' ],
		};

		this.module.cmd.addCmd({
			key: 'message',
			next: [
				new RepeatStep(
					'chars',
					(next, idx) => this.module.cmdSteps.newAwakeCharStep({
						id: 'charId-' + idx,
						errRequired: null,
						next,
						...charListOpt,
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
							errRequired: step => new Err('message.messageRequired', "What do you want to message?"),
							maxLength: () => this.module.info.getCore().communicationMaxLength,
							errTooLong: communicationTooLong,
							completer: this.module.cmdLists.getCharsAwake(charListOpt),
							formatText: true,
						}),
					],
				}),
			],
			alias: [ 'm', 'msg', 'p', 'page' ],
			value: (ctx, p) => {
				let charIds = [];
				let i = 0;
				while (p['charId-' + i]) {
					charIds.push(p['charId-' + i]);
					i++;
				}
				return this.message(ctx.char, { charIds, msg: p.msg, pose: p.pose, ooc: p.ooc });
			},
		});

		this.module.help.addTopic({
			id: 'message',
			category: 'communicate',
			cmd: 'message',
			alias: [ 'm', 'msg', 'p', 'page' ],
			usage: l10n.l('message.usage', usageText),
			shortDesc: l10n.l('message.shortDesc', shortDesc),
			desc: l10n.l('message.helpText', helpText),
			examples,
			sortOrder: 40,
		});
	}

	message(char, params) {
		// If we are missing target charIds, we fetch the last ones targeted.
		let charIds = params.charIds || [];
		if (!charIds.length) {
			charIds = this.lastCharIds[char.id];
			if (!charIds) {
				return Promise.reject(new Err('message.noCharacter', "Who do you want to message?"));
			}
			params.charIds = charIds;
		} else {
			this.lastCharIds[char.id] = charIds;
		}
		return char.call('message', params);
	}
}

export default Message;
