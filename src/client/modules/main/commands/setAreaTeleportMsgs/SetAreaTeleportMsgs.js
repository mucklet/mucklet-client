import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import ListStep from 'classes/ListStep';
import ValueStep from 'classes/ValueStep';
import helpAttribDesc from 'utils/helpAttribDesc';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'set area  <span class="param">#AreaID<span class="comment">/</span>Area</span> : teleportmsgs : <span class="param">Type</span> <span class="opt">=</span> <span class="param">Value</span>';
const shortDesc = 'Set a custom area teleport message';
const helpText =
`<p>Set a custom area teleport message used as default when teleporting to and from rooms belonging to the area. It will not affect rooms in child areas.</p>
<code class="param">#AreaID</code> is the ID of the area to set.</p>
<code class="param">Area</code> is the name of an owned area to set.</p>`;

const defaultAttr = [
	{
		key: 'leave',
		value: 'teleportLeaveMsg',
		name: "leave message",
		desc: l10n.l('setAreaTeleportMsgs.leaveMsgDesc', "Message seen by the room when a character teleports away from there. The character's name will be prepended."),
		examples: [{
			cmd: 'set area Town teleportmsgs : leave = is picked up by a taxi.',
			desc: l10n.l('setAreaTeleportMsgs.leaveExample', "Sets message seen when someone arrives to a room in the Town area."),
		}],
		sortOrder: 200,
	},
	{
		key: 'arrive',
		value: 'teleportArriveMsg',
		name: "arrival message",
		desc: l10n.l('setAreaTeleportMsgs.arriveMsgDesc', "Message seen by the room when a character teleports there. The character's name will be prepended."),
		examples: [{
			cmd: 'set area Town teleportmsgs : arrive = is dropped off by a taxi.',
			desc: l10n.l('setAreaTeleportMsgs.arriveExample', "Sets message seen when someone leaves a room in the Town area."),
		}],
		sortOrder: 210,
	},
	{
		key: 'travel',
		value: 'teleportTravelMsg',
		name: "travel message",
		desc: l10n.l('setAreaTeleportMsgs.travelMsgDesc', "Message seen by the teleporting character when they teleport into the area. The character's name will be prepended."),
		examples: [{
			cmd: 'set area Town teleportmsgs : travel = takes a taxi.',
			desc: l10n.l('setAreaTeleportMsgs.travelExample', "Sets message seen by the character arriving to a room in the Town area."),
		}],
		sortOrder: 220,
	},
	{
		key: 'override',
		value: 'overrideCharTeleportMsgs',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "override character messages flag" }),
		name: "override character teleport message",
		desc: l10n.l('setAreaTeleportMsgs.overrideCharTeleportMsgsDesc', "Flag to override any custom teleport messages set for the teleporting character.  Value is <code>yes</code> or <code>no</code>."),
		examples: [{
			cmd: 'set area Town teleportmsgs : override = yes',
			desc: l10n.l('setAreaTeleportMsgs.overrideExample', "Sets flag to override character defined messages."),
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
			'setArea',
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

		this.module.setArea.addAttribute({
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
			desc: l10n.l('setAreaTeleportMsg.teleportmsgsDesc', "Use custom teleport messages. Value is <code>yes</code> or <code>no</code>. For setting specific messages, see <code>help set area teleportmsgs</code>."),
			sortOrder: 300,
		});

		this.module.help.addTopic({
			id: 'setAreaTeleportMsgs',
			cmd: 'set area teleportmsgs',
			usage: l10n.l('setAreaTeleportMsgs.usage', usageText),
			shortDesc: l10n.l('setAreaTeleportMsgs.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setAreaTeleportMsgs.helpText', helpText), this.teleportMsgType.getItems(), {
				attribute: l10n.t('setAreaTeleportMsgs.type', `<code class="param">Type</code>`),
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
