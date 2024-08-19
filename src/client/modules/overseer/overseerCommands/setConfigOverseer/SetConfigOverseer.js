import l10n from 'modapp-l10n';
import NumberStep from 'classes/NumberStep';

const defaultAttr = [
	// Max text lengths
	{
		key: 'descriptionMaxLength',
		stepFactory: () => new NumberStep('value', { name: "description max length" }),
		desc: l10n.l('setConfig.descriptionMaxLengthDesc', "Description max length."),
		sortOrder: 1000,
	},
	{
		key: 'shortDescriptionMaxLength',
		stepFactory: () => new NumberStep('value', { name: "short description max length" }),
		desc: l10n.l('setConfig.shortDescriptionMaxLengthDesc', "Short description max length."),
		sortOrder: 1010,
	},
	{
		key: 'communicationMaxLength',
		stepFactory: () => new NumberStep('value', { name: "communication max length" }),
		desc: l10n.l('setConfig.communicationMaxLengthDesc', "Communication max length."),
		sortOrder: 1020,
	},
	{
		key: 'itemNameMaxLength',
		stepFactory: () => new NumberStep('value', { name: "item name max length" }),
		desc: l10n.l('setConfig.itemNameMaxLengthDesc', "Item (exit, room, etc.) name max length."),
		sortOrder: 1030,
	},
	{
		key: 'propertyMaxLength',
		stepFactory: () => new NumberStep('value', { name: "property max length" }),
		desc: l10n.l('setConfig.propertyMaxLengthDesc', "Property (species, gender, etc.) max length."),
		sortOrder: 1040,
	},
	{
		key: 'keyMaxLength',
		stepFactory: () => new NumberStep('value', { name: "key max length" }),
		desc: l10n.l('setConfig.keyMaxLengthDesc', "Keyword (teleport, exit, etc.) max length."),
		sortOrder: 1050,
	},
	// Max/min name lengths
	{
		key: 'charNameMinLength',
		stepFactory: () => new NumberStep('value', { name: "character name min length" }),
		desc: l10n.l('setConfig.charNameMinLengthDesc', "Character name min length."),
		sortOrder: 1100,
	},
	{
		key: 'charNameMaxLength',
		stepFactory: () => new NumberStep('value', { name: "character name max length" }),
		desc: l10n.l('setConfig.charNameMaxLengthDesc', "Character name max length."),
		sortOrder: 1110,
	},
	{
		key: 'charSurnameMinLength',
		stepFactory: () => new NumberStep('value', { name: "character surname min length" }),
		desc: l10n.l('setConfig.charSurnameMinLengthDesc', "Character surname min length."),
		sortOrder: 1120,
	},
	{
		key: 'charSurnameMaxLength',
		stepFactory: () => new NumberStep('value', { name: "character surname max length" }),
		desc: l10n.l('setConfig.charSurnameMaxLengthDesc', "Character surname max length."),
		sortOrder: 1130,
	},
	// Max item values (role dependent)
	{
		key: 'maxOwnedChars',
		stepFactory: () => new NumberStep('value', { name: "max owned characters" }),
		desc: l10n.l('setConfig.maxOwnedCharsDesc', "Max number of owned characters."),
		sortOrder: 1200,
	},
	{
		key: 'maxCharProfiles',
		stepFactory: () => new NumberStep('value', { name: "max character profiles" }),
		desc: l10n.l('setConfig.maxCharProfilesDesc', "Max number of character profiles."),
		sortOrder: 1210,
	},
	{
		key: 'maxRoomProfiles',
		stepFactory: () => new NumberStep('value', { name: "max room profiles" }),
		desc: l10n.l('setConfig.maxRoomProfilesDesc', "Max number of room profiles."),
		sortOrder: 1220,
	},
	{
		key: 'adminMaxOwnedChars',
		stepFactory: () => new NumberStep('value', { name: "max owned characters for admins" }),
		desc: l10n.l('setConfig.adminMaxOwnedCharsDesc', "Max number of owned characters for admins."),
		sortOrder: 1230,
	},
	{
		key: 'adminMaxCharProfiles',
		stepFactory: () => new NumberStep('value', { name: "max character profiles for admins" }),
		desc: l10n.l('setConfig.adminMaxCharProfilesDesc', "Max number of character profiles for admins."),
		sortOrder: 1240,
	},
	{
		key: 'adminMaxRoomProfiles',
		stepFactory: () => new NumberStep('value', { name: "max room profiles for admins" }),
		desc: l10n.l('setConfig.adminMaxRoomProfilesDesc', "Max number of room profiles for admins."),
		sortOrder: 1250,
	},
	{
		key: 'builderMaxOwnedRooms',
		stepFactory: () => new NumberStep('value', { name: "max owned rooms for builders and admins" }),
		desc: l10n.l('setConfig.builderMaxOwnedRoomsDesc', "Max number of owned rooms for builders and admins."),
		sortOrder: 1260,
	},
	{
		key: 'builderMaxOwnedAreas',
		stepFactory: () => new NumberStep('value', { name: "max owned areas for builders and admins" }),
		desc: l10n.l('setConfig.builderMaxOwnedAreasDesc', "Max number of owned areas for builders and admins."),
		sortOrder: 1262,
	},
	{
		key: 'supporterMaxOwnedChars',
		stepFactory: () => new NumberStep('value', { name: "max owned characters for supporters" }),
		desc: l10n.l('setConfig.supporterMaxOwnedCharsDesc', "Max number of owned characters for supporters."),
		sortOrder: 1270,
	},
	{
		key: 'supporterMaxCharProfiles',
		stepFactory: () => new NumberStep('value', { name: "max character profiles for supporters" }),
		desc: l10n.l('setConfig.supporterMaxCharProfilesDesc', "Max number of character profiles for supporters."),
		sortOrder: 1280,
	},
	{
		key: 'supporterMaxRoomProfiles',
		stepFactory: () => new NumberStep('value', { name: "max room profiles for supporters" }),
		desc: l10n.l('setConfig.supporterMaxRoomProfilesDesc', "Max number of room profiles for supporters."),
		sortOrder: 1290,
	},
	// Max item values (non-role dependent)
	{
		key: 'maxOwnedRooms',
		stepFactory: () => new NumberStep('value', { name: "max owned rooms" }),
		desc: l10n.l('setConfig.maxOwnedRoomsDesc', "Max number of owned rooms."),
		sortOrder: 1300,
	},
	{
		key: 'maxRoomExits',
		stepFactory: () => new NumberStep('value', { name: "max room exits" }),
		desc: l10n.l('setConfig.maxRoomExitsDesc', "Max number of room exits."),
		sortOrder: 1310,
	},
	{
		key: 'maxOwnedAreas',
		stepFactory: () => new NumberStep('value', { name: "max owned areas" }),
		desc: l10n.l('setConfig.maxOwnedAreasDesc', "Max number of owned areas."),
		sortOrder: 1320,
	},
	{
		key: 'maxFollows',
		stepFactory: () => new NumberStep('value', { name: "max follows" }),
		desc: l10n.l('setConfig.maxFollowsDesc', "Max number of character's following someone."),
		sortOrder: 1330,
	},
	{
		key: 'maxRoomScripts',
		stepFactory: () => new NumberStep('value', { name: "max room scripts" }),
		desc: l10n.l('setConfig.maxRoomScriptsDesc', "Max number of room scripts per room."),
		sortOrder: 1340,
	},
	{
		key: 'maxScheduledPosts',
		stepFactory: () => new NumberStep('value', { name: "max scheduled script posts" }),
		desc: l10n.l('setConfig.maxScheduledPostsDesc', "Max number of scheduled posts per script."),
		sortOrder: 1350,
	},
];

/**
 * SetConfigOverseer adds overseer only fields to the set config command.
 */
class SetConfigOverseer {
	constructor(app) {
		this.app = app;

		this.app.require([ 'setConfig' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		for (let o of defaultAttr) {
			this.module.setConfig.addAttribute(o);
		}
	}
}

export default SetConfigOverseer;
