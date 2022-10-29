import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import ListStep from 'classes/ListStep';

const usageText = 'profile <span class="param">Keyword</span>';
const shortDesc = "Change into one of your character's profiles";
const helpText =
`<p>Change your character's appearance to one of the profiles. This affects the <em>gender</em>, <em>species</em>, <em>description</em>, and <em>image</em>.</p>
<p><code class="param">Keyword</code> is the keyword for the character profile.</p>`;

/**
 * Profile adds the profile command.
 */
class Profile {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'charLog', 'confirm' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'profile',
			next: new ListStep('profileId', this.module.cmdLists.getCharProfiles(), {
				name: "character profile"
			}),
			value: (ctx, p) => this.profile(ctx.char, p, true)
		});

		this.module.help.addTopic({
			id: 'profile',
			category: 'profile',
			cmd: 'profile',
			usage: l10n.l('profile.usage', usageText),
			shortDesc: l10n.l('profile.shortDesc', shortDesc),
			desc: l10n.l('profile.helpText', helpText),
			sortOrder: 100,
		});
	}

	profile(char, p, safe) {
		return char.call('useProfile', { profileId: p.profileId, safe })
			.then(result => {
				this.module.charLog.logInfo(char, l10n.l('profile.changedToProfile', "Changed to profile \"{profileName}\".", { profileName: result.profile.name }));
				return true;
			})
			.catch(err => {
				if (err.code != 'core.charProfileNotStored') {
					return Promise.reject(err);
				}

				return new Promise((resolve, reject) => {
					let cb = { resolve, reject };
					// Confirm to overwrite current appearance
					let profile = this._getCharProfile(char, p.profileId);
					this.module.confirm.open(() => this.profile(char, p, false).then(applied => {
						cb && cb.resolve(applied);
					}, err => cb && cb.reject(err)).then(() => cb = null), {
						title: l10n.l('profile.discardChanges', "Discard changes"),
						body: new Elem(n => n.elem('div', [
							n.component(new Txt(l10n.l('profile.discardChangesBody', "Current appearance is not stored in any profile. Do you wish to apply this profile?"), { tagName: 'p' })),
							n.component(profile ? new ModelTxt(profile, m => m.name, { tagName: 'p', className: 'dialog--strong' }) : null),
							n.elem('p', { className: 'dialog--error' }, [
								n.component(new FAIcon('exclamation-triangle')),
								n.html("&nbsp;&nbsp;"),
								n.component(new Txt(l10n.l('profile.discardWarning', "Changes made to your character's appearance will be lost."))),
							]),
						])),
						confirm: l10n.l('profile.applyProfile', "Apply profile"),
						onClose: () => {
							if (cb) {
								cb.resolve(false);
							}
							cb = null;
						}
					});
				});
			});
	}

	_getCharProfile(char, profileId) {
		let profiles = char && char.profiles;
		if (profiles) {
			for (let profile of profiles) {
				if (profile.id == profileId) {
					return profile;
				}
			}
		}
		return null;
	}
}

export default Profile;
