import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import ListStep from 'classes/ListStep';

const usageText = 'roomprofile <span class="param">Keyword</span>';
const shortDesc = "Change room appearance into one of its profiles";
const helpText =
`<p>Change the room's appearance to one of its profiles. This affects the <em>description</em> and <em>image</em>.</p>
<p><code class="param">Keyword</code> is the keyword for the profile.</p>`;

/**
 * RoomProfile adds the room profile command.
 */
class RoomProfile {
	constructor(app) {
		this.app = app;

		this.app.require([
			'api',
			'cmd',
			'help',
			'charLog',
			'confirm',
			'roomAccess',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'roomprofile',
			next: new ListStep('profileId', this.module.roomAccess.getInRoomProfileTokens(), {
				name: "room profile",
			}),
			value: (ctx, p) => this.roomProfile(ctx.char, p.profileId, true),
		});

		this.module.help.addTopic({
			id: 'roomProfile',
			category: 'buildRooms',
			cmd: 'roomprofile',
			usage: l10n.l('roomProfile.usage', usageText),
			shortDesc: l10n.l('roomProfile.shortDesc', shortDesc),
			desc: l10n.l('roomProfile.helpText', helpText),
			sortOrder: 100,
		});
	}

	roomProfile(char, profileId, safe) {
		return char.call('useRoomProfile', { profileId, safe })
			.then(result => {
				this.module.charLog.logInfo(char, l10n.l('roomProfile.changedToRoomProfile', "Changed room to profile \"{profileName}\".", { profileName: result.profile.name }));
				return result;
			})
			.catch(err => {
				if (err.code != 'core.roomProfileNotStored') {
					return Promise.reject(err);
				}

				return this.module.api.get('core.roomprofile.' + profileId).then(profile => new Promise((resolve, reject) => {
					let cb = { resolve, reject };
					// Confirm to overwrite current appearance
					this.module.confirm.open(() => this.roomProfile(char, profileId, false).then(result => {
						cb && cb.resolve(result);
					}, err => cb && cb.reject(err)).then(() => cb = null), {
						title: l10n.l('roomProfile.discardChanges', "Discard changes"),
						body: new Elem(n => n.elem('div', [
							n.component(new Txt(l10n.l('roomProfile.discardChangesBody', "Current appearance is not stored in any room profile. Do you wish to apply this profile?"), { tagName: 'p' })),
							n.component(profile ? new ModelTxt(profile, m => m.name, { tagName: 'p', className: 'dialog--strong' }) : null),
							n.elem('p', { className: 'dialog--error' }, [
								n.component(new FAIcon('exclamation-triangle')),
								n.html("&nbsp;&nbsp;"),
								n.component(new Txt(l10n.l('roomProfile.discardWarning', "Changes made to the room's appearance will be lost."))),
							]),
						])),
						confirm: l10n.l('roomProfile.applyRoomProfile', "Apply profile"),
						onClose: () => {
							if (cb) {
								cb.resolve(null);
							}
							cb = null;
						},
					});
				}));
			});
	}
}

export default RoomProfile;
