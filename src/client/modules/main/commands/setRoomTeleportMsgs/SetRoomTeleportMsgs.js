import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import ListStep from 'classes/ListStep';
import ValueStep from 'classes/ValueStep';
import helpAttribDesc from 'utils/helpAttribDesc';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'set room teleportmsgs : <span class="param">Type</span> <span class="opt">=</span> <span class="param">Value</span>';
const shortDesc = 'Set a custom room teleport message';
const helpText =
`<p>Set a custom teleport message for the current room.</p>`;

const defaultAttr = [
	{
		key: 'leave',
		value: 'teleportLeaveMsg',
		name: "leave message",
		desc: l10n.l('setRoomTeleportMsgs.leaveMsgDesc', "Message seen by this room when a character teleports away from here. The character's name will be prepended."),
		examples: [{
			cmd: 'set room teleportmsgs : leave = enters the transport portal.',
			desc: l10n.l('setRoomTeleportMsgs.leaveExample', "Sets message seen when someone arrives."),
		}],
		sortOrder: 200,
	},
	{
		key: 'arrive',
		value: 'teleportArriveMsg',
		name: "arrival message",
		desc: l10n.l('setRoomTeleportMsgs.arriveMsgDesc', "Message seen by this room when a character teleports here. The character's name will be prepended."),
		examples: [{
			cmd: 'set room teleportmsgs : arrive = exits the transport portal.',
			desc: l10n.l('setRoomTeleportMsgs.arriveExample', "Sets message seen when someone leaves."),
		}],
		sortOrder: 210,
	},
	{
		key: 'travel',
		value: 'teleportTravelMsg',
		name: "travel message",
		desc: l10n.l('setRoomTeleportMsgs.travelMsgDesc', "Message seen by the teleporting character when they teleport here. The character's name will be prepended."),
		examples: [{
			cmd: 'set room teleportmsgs : travel = travels through the transport portal.',
			desc: l10n.l('setRoomTeleportMsgs.travelExample', "Sets message seen by the character arriving."),
		}],
		sortOrder: 220,
	},
	{
		key: 'override',
		value: 'overrideCharTeleportMsgs',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "override character messages flag" }),
		name: "override character teleport message",
		desc: l10n.l('setRoomTeleportMsgs.overrideCharTeleportMsgsDesc', "Flag to override any custom teleport messages set for the teleporting character.  Value is <code>yes</code> or <code>no</code>."),
		examples: [{
			cmd: 'set room teleportmsgs : override = yes',
			desc: l10n.l('setRoomTeleportMsgs.overrideExample', "Sets flag to override character defined messages."),
		}],
		sortOrder: 230,
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
			'setRoom',
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

		this.module.setRoom.addAttribute({
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
			desc: l10n.l('setRoomTeleportMsg.teleportmsgsDesc', "Use custom teleport messages. Value is <code>yes</code> or <code>no</code>. For setting specific messages, see <code>help set room teleportmsgs</code>."),
			sortOrder: 300,
		});

		this.module.help.addTopic({
			id: 'setRoomTeleportMsgs',
			cmd: 'set room teleportmsgs',
			usage: l10n.l('setRoomTeleportMsgs.usage', usageText),
			shortDesc: l10n.l('setRoomTeleportMsgs.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setRoomTeleportMsgs.helpText', helpText), this.teleportMsgType.getItems(), {
				attribute: l10n.t('setRoomTeleportMsgs.type', `<code class="param">Type</code>`),
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
			sortOrder: 25,
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
