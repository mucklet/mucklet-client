import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import ListStep from 'classes/ListStep';
import ValueStep from 'classes/ValueStep';
import helpAttribDesc from 'utils/helpAttribDesc';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'set teleportmsgs : <span class="param">Type</span> <span class="opt">=</span> <span class="param">Value</span>';
const shortDesc = 'Set a custom teleport message for your character';
const helpText =
`<p>Set a custom teleport message for your character.</p>`;

const defaultAttr = [
	{
		key: 'leave',
		value: 'teleportLeaveMsg',
		name: "leave message",
		desc: l10n.l('setTeleportMsgs.leaveMsgDesc', "Message seen by the origin room when teleporting away. The character's name will be prepended."),
		examples: [{
			cmd: 'set teleportmsgs : leave = disappears in a cloud of smoke.',
			desc: l10n.l('setTeleportMsgs.leaveExample', "Sets message seen by the originating room."),
		}],
		sortOrder: 200,
	},
	{
		key: 'arrive',
		value: 'teleportArriveMsg',
		name: "arrival message",
		desc: l10n.l('setTeleportMsgs.arriveMsgDesc', "Message seen by the arrival room when teleporting there. The character's name will be prepended."),
		examples: [{
			cmd: 'set teleportmsgs : arrive = appears in a cloud of smoke.',
			desc: l10n.l('setTeleportMsgs.arriveExample', "Sets message seen by the arrival room."),
		}],
		sortOrder: 210,
	},
	{
		key: 'travel',
		value: 'teleportTravelMsg',
		name: "travel message",
		desc: l10n.l('setTeleportMsgs.travelMsgDesc', "Message seen by you when teleporting. The character's name will be prepended."),
		examples: [{
			cmd: 'set teleportmsgs : travel = teleports to a new place.',
			desc: l10n.l('setTeleportMsgs.travelExample', "Sets message seen by you when teleporting."),
		}],
		sortOrder: 220,
	},
];

/**
 * SetTeleportMsg adds teleportmsg settings to the set command.
 */
class SetTeleportMsg {
	constructor(app) {
		this.app = app;

		this.app.require([
			'help',
			'info',
			'set',
			'cmdLists',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.teleportMsgType = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.set.addAttribute({
			key: 'teleportmsgs',
			nextFactory: module => new DelimStep(":", {
				next: new ListStep('attr', this.teleportMsgType, {
					name: "teleport message type",
					token: 'attr',
				}),
				else: [
					new DelimStep("=", { errRequired: null }),
					new ValueStep('attr', 'customTeleportMsgs'),
					new ListStep('value', this.module.cmdLists.getBool(), { name: "yes or no value" }),
				],
			}),
			desc: l10n.l('setTeleportMsg.teleportmsgsDesc', "Use custom teleport messages. Value is <code>yes</code> or <code>no</code>. For setting specific messages, see <code>help set teleportmsgs</code>."),
			sortOrder: 300,
			// value: this._exec.bind(this),
		});

		this.module.help.addTopic({
			id: 'setTeleportMsgs',
			cmd: 'set teleportmsgs',
			usage: l10n.l('setTeleportMsgs.usage', usageText),
			shortDesc: l10n.l('setTeleportMsgs.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setTeleportMsgs.helpText', helpText), this.teleportMsgType.getItems(), {
				attribute: l10n.t('setTeleportMsgs.type', `<code class="param">Type</code>`),
			}),
			examples: () => {
				let types = this.teleportMsgType.getItems();
				let examples = [];
				for (let t of types) {
					if (t.examples) {
						examples = examples.concat(t.examples);
					}
				}
				return examples;
			},
			sortOrder: 15,
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		next = next || [
			new DelimStep("=", { errRequired: null }),
			attr.stepFactory
				? attr.stepFactory(this.module)
				: new TextStep('value', {
					name: attr.name || attr.key,
					maxLength: () => this.module.info.getCore().communicationMaxLength,
					errTooLong: communicationTooLong,
				}),
		];
		let item = Object.assign({}, attr, { next });
		this.teleportMsgType.addItem(item);
		return this;
	}
}

export default SetTeleportMsg;
