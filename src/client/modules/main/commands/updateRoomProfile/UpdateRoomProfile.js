import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'update roomprofile <span class="param">Keyword</span>';
const shortDesc = "Update a room profile with the room's current appearance";
const helpText =
`<p>Update a room profile with the room's current appearance. This stores the <em>description</em> and <em>image</em>.</p>
<p><code class="param">Keyword</code> is the keyword for the profile.</p>`;

/**
 * UpdateRoomProfile adds the update profile command.
 */
class UpdateRoomProfile {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'help',
			'charLog',
			'roomAccess',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addPrefixCmd('update', {
			key: 'roomprofile',
			next: new ListStep('profileId', this.module.roomAccess.getInRoomProfileTokens(), {
				name: "room profile",
			}),
			value: (ctx, p) => this.updateRoomProfile(ctx.char, p),
		});

		this.module.help.addTopic({
			id: 'updateRoomProfile',
			category: 'buildRooms',
			cmd: 'update roomprofile',
			usage: l10n.l('updateRoomProfile.usage', usageText),
			shortDesc: l10n.l('updateRoomProfile.shortDesc', shortDesc),
			desc: l10n.l('updateRoomProfile.helpText', helpText),
			sortOrder: 140,
		});
	}

	updateRoomProfile(char, p) {
		return char.call('updateRoomProfile', { profileId: p.profileId })
			.then(result => this.module.charLog.logInfo(char, l10n.l('updateRoomProfile.updatedRoomProfile', "Updated room profile \"{profileName}\".", { profileName: result.profile.name })));
	}
}

export default UpdateRoomProfile;
