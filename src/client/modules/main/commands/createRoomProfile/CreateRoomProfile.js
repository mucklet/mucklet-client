import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import Err from 'classes/Err';
import { keyTooLong, itemNameTooLong } from 'utils/cmdErr';

const usageText = 'create roomprofile <span class="param">Keyword</span> = <span class="param">Name</span>';
const shortDesc = 'Create a room profile based on current appearance';
const helpText =
`<p>Create a room profile based on the room's current appearance. This stores the <em>description</em> and <em>image</em>.</p>
<p><code class="param">Keyword</code> is the keyword to use for the profile.</p>
<p><code class="param">Name</code> is a descriptive name for the profile.</p>`;

/**
 * CreateRoomProfile adds command to create a profile based on the room's current appearance.
 */
class CreateRoomProfile {
	constructor(app) {
		this.app = app;

		this.app.require([
			'api',
			'cmd',
			'charLog',
			'help',
			'info',
			'createLimits',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('create', {
			key: 'roomprofile',
			next: [
				new TextStep('key', {
					regex: /^[\w\s]*\w/,
					name: "profile keyword",
					maxLength: () => this.module.info.getCore().keyMaxLength,
					errTooLong: keyTooLong,
				}),
				new DelimStep("=", {
					next: [
						new TextStep('name', {
							name: "profile name",
							maxLength: () => this.module.info.getCore().itemNameMaxLength,
							errTooLong: itemNameTooLong,
							errRequired: step => new Err('createRoomProfile.nameRequired', "What would the descriptive name of the profile be?"),
						}),
					],
				}),
			],
			value: (ctx, p) => this.createRoomProfile(ctx.char, {
				key: p.key,
				name: p.name,
			}),
		});

		this.module.help.addTopic({
			id: 'createRoomProfile',
			category: 'buildRooms',
			cmd: 'create roomprofile',
			usage: l10n.l('createRoomProfile.usage', usageText),
			shortDesc: l10n.l('createRoomProfile.shortDesc', shortDesc),
			desc: l10n.l('createRoomProfile.helpText', helpText),
			sortOrder: 110,
		});
	}

	createRoomProfile(char, params) {
		return this.module.api.get('core.room.' + char.inRoom.id + '.profiles').then(profiles => {
			let errComponent = this.module.createLimits.getRoomProfilesError(profiles);
			if (errComponent) {
				return this.module.charLog.logComponent(char, 'error', errComponent);
			}
			return char.call('createRoomProfile', params).then(result => {
				this.module.charLog.logInfo(char, l10n.l('createRoomProfile.roomProfileCreated', "Created room profile \"{profileName}\".", { profileName: result.profile.name }));
			});
		});
	}
}

export default CreateRoomProfile;
