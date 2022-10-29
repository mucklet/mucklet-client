import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';
import { descriptionTooLong, propertyTooLong, } from 'utils/cmdErr';

const usageText = 'set <span class="param">Attribute</span> <span class="opt">=</span> <span class="param">Value</span>';
const shortDesc = 'Set an attribute of your character';
const helpText =
`<p>Set an attribute of your character.</p>`;

const defaultAttr = [
	{
		key: 'name',
		name: "character name",
		desc: l10n.l('set.nameDesc', "Name which may contain numbers, letters, dash (-), and apostrophe (')."),
		sortOrder: 10
	},
	{
		key: 'surname',
		name: "character surname",
		desc: l10n.l('set.surnameDesc', "Surname which may contain numbers, letters, dash (-), apostrophe ('), and spaces. It may also be titles (eg. \"the Beast\") or other creative name endings."),
		sortOrder: 20
	},
	{
		key: 'desc',
		stepFactory: module => new TextStep('value', {
			name: "character description",
			maxLength: () => module.info.getCore().descriptionMaxLength,
			errTooLong: descriptionTooLong,
			spanLines: true
		}),
		desc: l10n.l('set.descDesc', "Description of the character's appearance. It may be formatted and span multiple paragraphs."),
		sortOrder: 30
	},
	{
		key: 'about',
		stepFactory: module => new TextStep('value', {
			name: "about the character",
			maxLength: () => module.info.getCore().descriptionMaxLength,
			errTooLong: descriptionTooLong,
			spanLines: true
		}),
		desc: l10n.l('set.aboutDesc', "Information about the character and its player's preferences. It may be formatted and span multiple paragraphs."),
		sortOrder: 40
	},
	{
		key: 'gender',
		stepFactory: module => new TextStep('value', {
			name: "character gender",
			maxLength: () => module.info.getCore().propertyMaxLength,
			errTooLong: propertyTooLong
		}),
		desc: l10n.l('set.genderDesc', "Gender of the character."),
		sortOrder: 50
	},
	{
		key: 'species',
		stepFactory: module => new TextStep('value', {
			name: "character species",
			maxLength: () => module.info.getCore().propertyMaxLength,
			errTooLong: propertyTooLong
		}),
		desc: l10n.l('set.speciesDesc', "Species of the character."),
		sortOrder: 60
	},
];

/**
 * Set adds command to set character attributes.
 */
class Set {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.charAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key)
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.help.addTopic({
			id: 'set',
			category: 'profile',
			cmd: 'set',
			usage: l10n.l('set.usage', usageText),
			shortDesc: l10n.l('set.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('set.helpText', helpText), this.charAttr.getItems()),
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
					name: attr.name || attr.key
				})
		];
		let item = Object.assign({}, attr, { next });
		this.charAttr.addItem(item);

		if (item.key) {
			if (!item.value) {
				item.value = (ctx, p) => this._exec(ctx, Object.assign({ attr: item.key }, p));
			}
			this.module.cmd.addPrefixCmd('set', item);
		}
		return this;
	}

	_exec(ctx, p) {
		let f = p.attr;
		return typeof f == 'function'
			? f(ctx, p, this)
			: this.set(ctx, p);
	}

	set(ctx, p) {
		return ctx.char.call('set', {
			[p.attr]: p.value
		}).then(() => {
			this.module.charLog.logInfo(ctx.char, l10n.l('set.updatedCharacter', "Character attribute was successfully set."));
		});
	}
}

export default Set;
