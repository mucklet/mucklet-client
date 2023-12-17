import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import ValueStep from 'classes/ValueStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';

const usageText = 'set config <span class="param">Attribute</span> <span class="opt"><span class="param">Subattribute</span></span> <span class="opt">=</span> <span class="param">Value</span>';
const shortDesc = 'Set a world configuration attribute';
const helpText =
`<p>Set a world configuration attribute.</p>`;

const defaultAttr = [
	// General attributes
	{
		key: 'title',
		name: "world title",
		desc: l10n.l('setConfig.titleDesc', "World title."),
		sortOrder: 10,
	},
	{
		key: 'genre',
		name: "world genre",
		desc: l10n.l('setConfig.genreDesc', "World genre."),
		sortOrder: 12,
	},
	{
		key: 'subgenre',
		name: "world subgenre",
		desc: l10n.l('setConfig.subgenreDesc', "World subgenre."),
		sortOrder: 12,
	},
	{
		key: 'greeting',
		stepFactory: (module) => new TextStep('value', {
			name: "greeting html",
			spanLines: true,
		}),
		desc: l10n.l('setConfig.greetingDesc', "Front page greeting message (HTML)."),
		sortOrder: 20,
	},
	{
		key: 'arrivalRoom',
		stepFactory: (module) => new ValueStep('valueRoomId', true),
		desc: l10n.l('setConfig.arrivalRoomDesc', "Value is omitted. Sets current room as arrival room."),
		sortOrder: 30,
	},
	{
		key: 'defaultHome',
		stepFactory: (module) => new ValueStep('valueRoomId', true),
		desc: l10n.l('setConfig.defaultHomeDesc', "Value is omitted. Sets current room as default home."),
		sortOrder: 40,
	},
	{
		key: 'arrivalMsg',
		stepFactory: () => new TextStep('value', {
			name: "arrival message",
			spanLines: true,
		}),
		desc: l10n.l('setConfig.arrivalMsgDesc', "Arrival message for characters in the arrival room."),
		sortOrder: 50,
	},
	{
		key: 'deleteCharMsg',
		stepFactory: () => new TextStep('value', {
			name: "deleted character message",
			spanLines: true,
		}),
		desc: l10n.l('setConfig.deleteCharMsgDesc', "Deletion message for others in the room of the character being deleted."),
		sortOrder: 60,
	},
	{
		key: 'quietMsg',
		stepFactory: () => new TextStep('value', {
			name: "quiet room message",
			spanLines: true,
		}),
		desc: l10n.l('setConfig.quietMsgDesc', "Quiet message shown when trying to communicate in a quiet room."),
		sortOrder: 70,
	},
	{
		key: 'fallAsleepMsg',
		stepFactory: () => new TextStep('value', {
			name: "fall asleep message",
			spanLines: true,
		}),
		desc: l10n.l('setConfig.fallAsleepMsgDesc', "Fall asleep message shown to the room when a character falls asleep."),
		sortOrder: 71,
	},
	{
		key: 'wakeUpMsg',
		stepFactory: () => new TextStep('value', {
			name: "wake up message",
			spanLines: true,
		}),
		desc: l10n.l('setConfig.wakeUpMsgDesc', "Wake up message shown to the room room when a character wakes up."),
		sortOrder: 72,
	},
	{
		key: 'dazedMsg',
		stepFactory: () => new TextStep('value', {
			name: "dazed message",
			spanLines: true,
		}),
		desc: l10n.l('setConfig.dazedMsgDesc', "Dazed message shown to the room when a previous puppeteer leaves control over an awake puppet."),
		sortOrder: 73,
	},
	{
		key: 'recoverFromDazeMsg',
		stepFactory: () => new TextStep('value', {
			name: "recover from daze message",
			spanLines: true,
		}),
		desc: l10n.l('setConfig.recoverFromDazeMsgDesc', "Recover from daze message shown when a new puppeteer takes control over a dazed puppet."),
		sortOrder: 74,
	},
	{
		key: 'notAPuppetMsg',
		stepFactory: () => new TextStep('value', {
			name: "not a puppet message",
			spanLines: false,
		}),
		desc: l10n.l('setConfig.notAPuppetMsgDesc', "Reject message shown on a request to take control of character that is not a puppet."),
		sortOrder: 75,
	},
	{
		key: 'puppetControlledByOtherMsg',
		stepFactory: () => new TextStep('value', {
			name: "puppet controlled by other message",
			spanLines: false,
		}),
		desc: l10n.l('setConfig.puppetControlledByOtherMsgDesc', "Reject message shown when trying to take control of a puppet already in control by someone else."),
		sortOrder: 76,
	},
	{
		key: 'defaultDoNotDisturbMsg',
		stepFactory: () => new TextStep('value', {
			name: "default do not disturb message",
			spanLines: true,
		}),
		desc: l10n.l('setConfig.defaultDoNotDisturbMsgDesc', "Do not disturb message shown when a character doesn't have a custom do not disturb message set."),
		sortOrder: 77,
	},
	{
		key: 'sweepMsg',
		stepFactory: () => new TextStep('value', {
			name: "sweep message",
			spanLines: true,
		}),
		desc: l10n.l('setConfig.sweepMsgDesc', "Sweep message shown to the room after sweeping."),
		sortOrder: 78,
	},

	// Movement messages
	{
		key: 'teleportHome',
		nextFactory: module => module.self._createMoveMsgItem(),
		desc: l10n.l('setConfig.teleportHomeDesc', "Teleport home move messages. Has subattributes <code>leaveMsg</code>, <code>arriveMsg</code>, and <code>travelMsg</code>."),
		sortOrder: 100,
	},
	{
		key: 'teleport',
		nextFactory: module => module.self._createMoveMsgItem(),
		desc: l10n.l('setConfig.teleportDesc', "Teleport move messages. Has subattributes <code>leaveMsg</code>, <code>arriveMsg</code>, and <code>travelMsg</code>."),
		sortOrder: 110,
	},
	{
		key: 'summon',
		nextFactory: module => module.self._createMoveMsgItem(),
		desc: l10n.l('setConfig.summonDesc', "Summon move messages. Has subattributes <code>leaveMsg</code>, <code>arriveMsg</code>, and <code>travelMsg</code>."),
		sortOrder: 120,
	},
];

/**
 * SetConfig sets world configuration.
 */
class SetConfig {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'helpAdmin' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.configAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'config',
			next: new ListStep('attr', this.configAttr, {
				name: "config attribute",
				token: 'attr',
			}),
			value: (ctx, p) => this.setConfig({
				[p.attr]: p.valueRoomId
					? ctx.char.inRoom.id
					: ((p.subAttr ? { [p.subAttr]: p.value } : p.value)),
			}),
		});

		this.module.helpAdmin.addTopic({
			id: 'setConfig',
			cmd: 'set config',
			usage: l10n.l('setConfig.usage', usageText),
			shortDesc: l10n.l('setConfig.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setConfig.helpText', helpText), this.configAttr.getItems()),
			sortOrder: 10,
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
				}),
		];
		this.configAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	setConfig(params) {
		let mod = this.module.player;
		return mod.getPlayer().call('setConfig', params).then(() => {
			this.module.charLog.logInfo(mod.getActiveChar(), l10n.l('setConfig.updatedConfig', "Updated world config."));
		});
	}

	_createMoveMsgItem() {
		return new ListStep('subAttr', new ItemList({
			items: [{
				key: 'leaveMsg',
				next: [
					new DelimStep("=", { errRequired: null }),
					new TextStep('value', {
						name: "leave message",
						spanLines: true,
					}),
				],
			}, {
				key: 'arriveMsg',
				next: [
					new DelimStep("=", { errRequired: null }),
					new TextStep('value', {
						name: "arrive message",
						spanLines: true,
					}),
				],
			}, {
				key: 'travelMsg',
				next: [
					new DelimStep("=", { errRequired: null }),
					new TextStep('value', {
						name: "travel message",
						spanLines: true,
					}),
				],
			}],
		}), {
			name: "config attribute",
			token: 'attr',
		});
	}
}

export default SetConfig;
