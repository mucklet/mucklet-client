import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import ListStep from 'classes/ListStep';

const usageText = 'room profile <span class="param">Keyword</span>';
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
			'roomProfiles',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'roomprofile',
			next: new ListStep('profileId', this.module.roomProfiles.getInRoomProfileTokens(), {
				name: "room profile",
			}),
			value: (ctx, p) => this.profile(ctx.char, p, true),
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

	profile(char, p, safe) {
		return char.call('useRoomProfile', { profileId: p.profileId, safe })
			.then(result => {
				this.module.charLog.logInfo(char, l10n.l('roomProfile.changedToRoomProfile', "Changed room to profile \"{profileName}\".", { profileName: result.profile.name }));
				return true;
			})
			.catch(err => {
				if (err.code != 'core.roomProfileNotStored') {
					return Promise.reject(err);
				}

				return this.module.api.get('core.roomprofile.' + p.profileId).then(profile => new Promise((resolve, reject) => {
					let cb = { resolve, reject };
					// Confirm to overwrite current appearance
					this.module.confirm.open(() => this.profile(char, p, false).then(applied => {
						cb && cb.resolve(applied);
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
								cb.resolve(false);
							}
							cb = null;
						},
					});
				}));
			});
	}
}

export default RoomProfile;
