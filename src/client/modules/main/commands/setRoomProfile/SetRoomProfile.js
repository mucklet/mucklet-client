import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';
import { descriptionTooLong, itemNameTooLong, keyTooLong } from 'utils/cmdErr';
import { modeDescription } from 'utils/formatText';

const usageText = 'set roomprofile <span class="param">Keyword</span> : <span class="param">Attribute</span> = <span class="param">Value</span>';
const shortDesc = 'Set a room profile attribute';
const helpText =
`<p>Set a room profile attribute.</p>
<p><code class="param">Keyword</code> is the keyword for the room profile.</p>`;

const defaultAttr = [
	{
		key: 'name',
		stepFactory: module => new TextStep('value', {
			name: "profile name",
			maxLength: () => module.info.getCore().itemNameMaxLength,
			errTooLong: itemNameTooLong,
		}),
		desc: l10n.l('setRoomProfile.nameDesc', "A descriptive profile name."),
		sortOrder: 10,
	},
	{
		key: 'keyword',
		value: 'key',
		stepFactory: module => new TextStep('value', {
			regex: /^[\w\s]*\w/,
			name: "room profile keyword",
			maxLength: () => module.info.getCore().keyMaxLength,
			errTooLong: keyTooLong,
		}),
		desc: l10n.l('setRoomProfile.keywordDesc', "Profile keyword."),
		sortOrder: 20,
	},
	{
		key: 'desc',
		stepFactory: module => new TextStep('value', {
			name: "profile's room description",
			maxLength: () => module.info.getCore().descriptionMaxLength,
			errTooLong: descriptionTooLong,
			spanLines: true,
			formatText: { mode: modeDescription },
		}),
		desc: l10n.l('setRoomProfile.descDesc', "Description of the room's appearance. It may be formatted and span multiple paragraphs."),
		sortOrder: 30,
	},
];

/**
 * SetRoomProfile adds command to set room profile attributes.
 */
class SetRoomProfile {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'help',
			'info',
			'roomAccess',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.profileAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'roomprofile',
			next: [
				new ListStep('profileId', this.module.roomAccess.getInRoomProfileTokens(), {
					name: "room profile",
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.profileAttr, {
					name: "room profile attribute",
					token: 'attr',
				}),
			],
			value: (ctx, p) => typeof p.attr == 'function'
				? p.attr(ctx, p)
				: this.setRoomProfile(ctx.char, {
					profileId: p.profileId,
					[p.attr]: p.value,
				}),
		});

		this.module.help.addTopic({
			id: 'setRoomProfile',
			category: 'buildRooms',
			cmd: 'set roomprofile',
			usage: l10n.l('setRoomProfile.usage', usageText),
			shortDesc: l10n.l('setRoomProfile.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setRoomProfile.helpText', helpText), this.profileAttr.getItems()),
			sortOrder: 130,
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		next = typeof next == 'undefined'
			? [
				new DelimStep("=", { errRequired: null }),
				attr.stepFactory
					? attr.stepFactory(this.module)
					: new TextStep('value', {
						name: attr.name || attr.key,
					}),
			]
			: next;
		this.profileAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	setRoomProfile(char, params) {
		return char.call('setRoomProfile', params)
			.then(result => this.module.charLog.logInfo(char, l10n.l('setRoomProfile.roomProfileSet', "Successfully set attribute of room profile \"{name}\".", result.profile)));
	}
}

export default SetRoomProfile;
