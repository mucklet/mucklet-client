import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import { descriptionTooLong, propertyTooLong } from 'utils/cmdErr';

const defaultAttr = [
	{
		key: 'name',
		name: "character name",
		desc: l10n.l('setChar.nameDesc', "Name which may contain numbers, letters, dash (-), and apostrophe (')."),
		sortOrder: 10,
	},
	{
		key: 'surname',
		name: "character surname",
		desc: l10n.l('setChar.surnameDesc', "Surname which may contain numbers, letters, dash (-), apostrophe ('), and spaces. It may also be titles (eg. \"the Beast\") or other creative name endings."),
		sortOrder: 20,
	},
	{
		key: 'desc',
		stepFactory: module => new TextStep('value', {
			name: "character description",
			maxLength: () => module.info.getCore().descriptionMaxLength,
			errTooLong: descriptionTooLong,
			spanLines: true,
		}),
		desc: l10n.l('setChar.descDesc', "Description of the character's appearance. It may be formatted and span multiple paragraphs."),
		sortOrder: 30,
	},
	{
		key: 'about',
		stepFactory: module => new TextStep('value', {
			name: "about the character",
			maxLength: () => module.info.getCore().descriptionMaxLength,
			errTooLong: descriptionTooLong,
			spanLines: true,
		}),
		desc: l10n.l('setChar.aboutDesc', "Information about the character and its player's preferences. It may be formatted and span multiple paragraphs."),
		sortOrder: 40,
	},
	{
		key: 'gender',
		stepFactory: module => new TextStep('value', {
			name: "character gender",
			maxLength: () => module.info.getCore().propertyMaxLength,
			errTooLong: propertyTooLong,
		}),
		desc: l10n.l('setChar.genderDesc', "Gender of the character."),
		sortOrder: 50,
	},
	{
		key: 'species',
		stepFactory: module => new TextStep('value', {
			name: "character species",
			maxLength: () => module.info.getCore().propertyMaxLength,
			errTooLong: propertyTooLong,
		}),
		desc: l10n.l('setChar.speciesDesc', "Species of the character."),
		sortOrder: 60,
	},
];

/**
 * SetCharAttr adds common character attributes to the set char command.
 */
class SetCharAttr {
	constructor(app) {
		this.app = app;

		this.app.require([ 'setChar' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		for (let o of defaultAttr) {
			this.module.setChar.addAttribute(o);
		}
	}
}

export default SetCharAttr;
