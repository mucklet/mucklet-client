import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import ValueStep from 'classes/ValueStep';
import Err from 'classes/Err';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'pose <span class="param">Message</span>';
const shortDesc = 'Pose an action for the room';
const helpText =
`<p>Depict an action for all the characters in the room.</p>
<p>If the message starts with <code>&gt;</code> (greater than), the action will be marked as out of character (OOC).</p>
<p><code class="param">Action</code> is the depicted action. It may be formatted and span multiple paragraphs. If it starts with <code>'</code> (apostrophe), no space will be added between the character's name and the action text.</p>
<p>Alias: <code>:</code> (colon), <code>/me</code></p>`;

/**
 * Pose adds the pose command.
 */
class Pose {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'pose',
			next: [
				new DelimStep(">", { next: new ValueStep('ooc', true), errRequired: null }),
				new TextStep('msg', {
					spanLines: true,
					token: state => state.getParam('ooc') ? 'ooc' : 'text',
					errRequired: step => new Err('pose.messageRequired', "What is your pose message?"),
					maxLength: () => this.module.info.getCore().communicationMaxLength,
					errTooLong: communicationTooLong,
					completer: this.module.cmdLists.getInRoomChars({
						filterMuted: true,
						sortOrder: [ 'awake', 'watch' ],
					}),
					formatText: true,
				}),
			],
			symbol: ':',
			alias: [ '/me' ],
			value: this.pose.bind(this),
		});

		this.module.help.addTopic({
			id: 'pose',
			category: 'communicate',
			cmd: 'pose',
			alias: [ ':', '/me' ],
			usage: l10n.l('pose.usage', usageText),
			shortDesc: l10n.l('pose.shortDesc', shortDesc),
			desc: l10n.l('pose.helpText', helpText),
			sortOrder: 20,
		});
	}

	pose(ctx, p) {
		return p.ooc
			? ctx.char.call('ooc', { msg: p.msg, pose: true })
			: ctx.char.call('pose', { msg: p.msg });
	}
}

export default Pose;
