import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'delete roomprofile <span class="param">Keyword</span>';
const shortDesc = 'Delete a room profile';
const helpText =
`<p>Delete a room profile.</p>
<p><code class="param">Keyword</code> is the keyword for the room profile.</p>`;

/**
 * DeleteRoomProfile adds command to delete a room profile.
 */
class DeleteRoomProfile {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'help',
			'roomProfiles',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('delete', {
			key: 'roomprofile',
			next: [
				new ListStep('profileId', this.module.roomProfiles.getInRoomProfileTokens(), {
					name: "room profile to delete",
				}),
			],
			value: (ctx, p) => this.deleteRoomProfile(ctx.char, {
				profileId: p.profileId,
			}),
		});

		this.module.help.addTopic({
			id: 'deleteRoomProfile',
			category: 'buildRooms',
			cmd: 'delete roomprofile',
			usage: l10n.l('deleteRoomProfile.usage', usageText),
			shortDesc: l10n.l('deleteRoomProfile.shortDesc', shortDesc),
			desc: l10n.l('deleteRoomProfile.helpText', helpText),
			sortOrder: 150,
		});
	}

	deleteRoomProfile(char, params) {
		return char.call('deleteRoomProfile', params)
			.then(result => this.module.charLog.logInfo(char, l10n.l('deleteRoomProfile.roomProfileDeleted', "Deleted room profile \"{profileName}\".", { profileName: result.profile.name })));
	}
}

export default DeleteRoomProfile;
