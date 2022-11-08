import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'delete profile <span class="param">Keyword</span>';
const shortDesc = 'Delete a character profile';
const helpText =
`<p>Delete a character profile.</p>
<p><code class="param">Keyword</code> is the keyword for the character profile.</p>`;

/**
 * DeleteProfile adds command to delete a character profile.
 */
class DeleteProfile {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('delete', {
			key: 'profile',
			next: [
				new ListStep('profileId', this.module.cmdLists.getCharProfiles(), {
					name: "character profile to delete",
				}),
			],
			value: (ctx, p) => this.deleteProfile(ctx.char, {
				profileId: p.profileId,
			}),
		});

		this.module.help.addTopic({
			id: 'deleteProfile',
			category: 'profile',
			cmd: 'delete profile',
			usage: l10n.l('deleteProfile.usage', usageText),
			shortDesc: l10n.l('deleteProfile.shortDesc', shortDesc),
			desc: l10n.l('deleteProfile.helpText', helpText),
			sortOrder: 150,
		});
	}

	deleteProfile(char, params) {
		return char.call('deleteProfile', params)
			.then(result => this.module.charLog.logInfo(char, l10n.l('deleteProfile.characterProfileDeleted', "Deleted character profile \"{profileName}\".", { profileName: result.profile.name })));
	}
}

export default DeleteProfile;
