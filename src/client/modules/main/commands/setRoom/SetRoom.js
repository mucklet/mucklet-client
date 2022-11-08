import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import IDStep from 'classes/IDStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';
import parseDuration, { durationRegex } from 'utils/parseDuration';
import { descriptionTooLong, itemNameTooLong } from 'utils/cmdErr';

const usageText = 'set room <span class="param">Attribute</span> = <span class="param">Value</span>';
const shortDesc = 'Set a room attribute';
const helpText =
`<p>Set an attribute of current room.</p>`;

const defaultAttr = [
	{
		key: 'name',
		stepFactory: module => new TextStep('value', {
			name: "room name",
			maxLength: () => module.info.getCore().itemNameMaxLength,
			errTooLong: itemNameTooLong,
		}),
		desc: l10n.l('setRoom.nameDesc', "Name of the room."),
		sortOrder: 10,
	},
	{
		key: 'desc',
		stepFactory: module => new TextStep('value', {
			name: "room description",
			maxLength: () => module.info.getCore().descriptionMaxLength,
			errTooLong: descriptionTooLong,
			spanLines: true,
		}),
		desc: l10n.l('setRoom.descDesc', "Description of the room. It may be formatted and span multiple paragraphs."),
		sortOrder: 20,
	},
	{
		key: 'area',
		value: 'areaId',
		stepFactory: module => new IDStep('value', {
			name: "area ID",
			list: () => {
				let c = module.player.getActiveChar();
				return ((c && c.ownedAreas && c.ownedAreas.toArray()) || []).map(v => v.id);
			},
			else: new ListStep('value', module.cmdLists.getCharOwnedAreas(true), {
				name: "area",
			}),
		}),
		desc: l10n.l('setRoom.areaDesc', "#AreaID, or name of owned area, to set for the room. Or <code>none</code> to unset current area. List owned areas with <code>list areas</code>."),
		sortOrder: 25,
	},
	{
		key: 'isdark',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "is dark flag" }),
		desc: l10n.l('setRoom.isDarkDesc', "Flag telling if the room is dark, preventing characters to see who else are in the room. Value is <code>yes</code> or <code>no</code>."),
		sortOrder: 30,
	},
	{
		key: 'isquiet',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "is quiet flag" }),
		desc: l10n.l('setRoom.isQuietDesc', "Flag telling if the room is quiet, preventing characters to communicate inside the room. Value is <code>yes</code> or <code>no</code>."),
		sortOrder: 40,
	},
	{
		key: 'ishome',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "is home flag" }),
		desc: l10n.l('setRoom.isHomeDesc', "Flag telling if the room allows residents, allowing characters to set it as home. Value is <code>yes</code> or <code>no</code>."),
		sortOrder: 50,
	},
	{
		key: 'isteleport',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "is teleport flag" }),
		desc: l10n.l('setRoom.isTeleportDesc', "Flag telling if other characters can add the room as a teleport destination. Value is <code>yes</code> or <code>no</code>."),
		sortOrder: 60,
	},
	{
		key: 'autosweep',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "autosweep flag" }),
		desc: l10n.l('setRoom.autosweepDesc', "Flag telling if the room should be automatically swept from sleepers. Value is <code>yes</code> or <code>no</code>."),
		sortOrder: 70,
	},
	{
		key: 'autosweepdelay',
		stepFactory: () => new TextStep('value', {
			name: "autosweep delay",
			regex: durationRegex,
			errRequired: () => ({ code: 'setRoom.durationRequired', message: 'Enter a duration in format "1h 2m 3s" for (h)ours, (m)inutes, and (s)econds.' }),
			spellcheck: false,
		}),
		desc: l10n.l('setRoom.autosweepDelayDesc', 'Delay before a sleeper is auto-swept from the room. Value format is <code>1h 2m 3s</code> for (h)ours, (m)inutes, and (s)econds.'),
		value: (ctx, p, self) => self._exec(ctx, { attr: 'autosweepdelay', value: parseDuration(p.value) }),
		sortOrder: 80,
	},
];

/**
 * SetRoom adds command to set the room attributes.
 */
class SetRoom {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help', 'player', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.roomAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'room',
			next: new ListStep('attr', this.roomAttr, {
				name: "room attribute",
				token: 'attr',
			}),
			value: this._exec.bind(this),
		});

		this.module.help.addTopic({
			id: 'setRoom',
			category: 'buildRooms',
			cmd: 'set room',
			usage: l10n.l('setRoom.usage', usageText),
			shortDesc: l10n.l('setRoom.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setRoom.helpText', helpText), this.roomAttr.getItems()),
			sortOrder: 20,
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		if (!next) {
			next = attr.stepFactory
				? attr.stepFactory(this.module)
				: new TextStep('value', {
					name: attr.name || attr.key,
				});
			next = Array.isArray(next) ? next : [ next ];
			next.unshift(new DelimStep("=", { errRequired: null }));
		}
		this.roomAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	_exec(ctx, p) {
		let f = p.attr;
		return typeof f == 'function'
			? f(ctx, p, this)
			: ctx.char.call('setRoom', {
				[f]: p.value,
			}).then(() => {
				this.module.charLog.logInfo(ctx.char, l10n.l('setRoom.updatedRoom', "Room attribute was successfully set."));
			});
	}
}

export default SetRoom;
