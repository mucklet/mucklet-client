import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';
import { descriptionTooLong, propertyTooLong, itemNameTooLong, keyTooLong } from 'utils/cmdErr';

const usageText = 'set profile <span class="param">Keyword</span> : <span class="param">Attribute</span> = <span class="param">Value</span>';
const shortDesc = 'Set a character profile attribute';
const helpText =
`<p>Set a character profile attribute.</p>
<p><code class="param">Keyword</code> is the keyword for the character profile.</p>`;

const defaultAttr = [
	{
		key: 'name',
		stepFactory: module => new TextStep('value', {
			name: "profile name",
			maxLength: () => module.info.getCore().itemNameMaxLength,
			errTooLong: itemNameTooLong,
		}),
		desc: l10n.l('setProfile.nameDesc', "A descriptive profile name."),
		sortOrder: 10,
	},
	{
		key: 'keyword',
		value: 'key',
		stepFactory: module => new TextStep('value', {
			regex: /^[\w\s]*\w/,
			name: "character profile keyword",
			maxLength: () => module.info.getCore().keyMaxLength,
			errTooLong: keyTooLong,
		}),
		desc: l10n.l('setProfile.keywordDesc', "Profile keyword."),
		sortOrder: 20,
	},
	{
		key: 'desc',
		stepFactory: module => new TextStep('value', {
			name: "profile's character description",
			maxLength: () => module.info.getCore().descriptionMaxLength,
			errTooLong: descriptionTooLong,
			spanLines: true,
			formatText: true,
		}),
		desc: l10n.l('setProfile.descDesc', "Description of the character's appearance. It may be formatted and span multiple paragraphs."),
		sortOrder: 30,
	},
	{
		key: 'gender',
		stepFactory: module => new TextStep('value', {
			name: "profile's character gender",
			maxLength: () => module.info.getCore().propertyMaxLength,
			errTooLong: propertyTooLong,
		}),
		desc: l10n.l('setProfile.genderDesc', "Gender of the character."),
		sortOrder: 40,
	},
	{
		key: 'species',
		stepFactory: module => new TextStep('value', {
			name: "profile's character species",
			maxLength: () => module.info.getCore().propertyMaxLength,
			errTooLong: propertyTooLong,
		}),
		desc: l10n.l('setProfile.speciesDesc', "Species of the character."),
		sortOrder: 50,
	},
];

/**
 * SetProfile adds command to set profile attributes.
 */
class SetProfile {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help', 'info' ], this._init.bind(this));
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
			key: 'profile',
			next: [
				new ListStep('profileId', this.module.cmdLists.getCharProfiles(), {
					name: "character profile",
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.profileAttr, {
					name: "character profile attribute",
					token: 'attr',
				}),
			],
			value: (ctx, p) => typeof p.attr == 'function'
				? p.attr(ctx, p)
				: this.setProfile(ctx.char, {
					profileId: p.profileId,
					[p.attr]: p.value,
				}),
		});

		this.module.help.addTopic({
			id: 'setProfile',
			category: 'profile',
			cmd: 'set profile',
			usage: l10n.l('setProfile.usage', usageText),
			shortDesc: l10n.l('setProfile.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setProfile.helpText', helpText), this.profileAttr.getItems()),
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

	setProfile(char, params) {
		return char.call('setProfile', params)
			.then(result => this.module.charLog.logInfo(char, l10n.l('setProfile.characterProfileSet', "Successfully set attribute of profile \"{name}\".", result.profile)));
	}
}

export default SetProfile;
