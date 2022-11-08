import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'update profile <span class="param">Keyword</span>';
const shortDesc = "Update a profile with your character's current appearance";
const helpText =
`<p>Update a profile with your character's current appearance.  This stores the <em>gender</em>, <em>species</em>, <em>description</em>, and <em>image</em>.</p>
<p><code class="param">Keyword</code> is the keyword for the character profile.</p>`;

/**
 * UpdateProfile adds the update profile command.
 */
class UpdateProfile {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addPrefixCmd('update', {
			key: 'profile',
			next: new ListStep('profileId', this.module.cmdLists.getCharProfiles(), {
				name: "character profile",
			}),
			value: (ctx, p) => this.updateProfile(ctx.char, p),
		});

		this.module.help.addTopic({
			id: 'updateProfile',
			category: 'profile',
			cmd: 'update profile',
			usage: l10n.l('updateProfile.usage', usageText),
			shortDesc: l10n.l('updateProfile.shortDesc', shortDesc),
			desc: l10n.l('updateProfile.helpText', helpText),
			sortOrder: 140,
		});
	}

	updateProfile(char, p) {
		return char.call('updateProfile', { profileId: p.profileId })
			.then(result => this.module.charLog.logInfo(char, l10n.l('profile.updatedProfile', "Updated profile \"{profileName}\".", { profileName: result.profile.name })));
	}
}

export default UpdateProfile;
