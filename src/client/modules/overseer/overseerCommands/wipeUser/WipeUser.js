import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import IDStep from 'classes/IDStep';
import TextStep from 'classes/TextStep';
import FAIcon from 'components/FAIcon';

const usageText = 'wipe user <span class="param">#UserID<span class="comment">/</span>@Username<span class="comment">/</span>Character</span>';
const shortDesc = 'Wipe and delete user account';
const helpText =
`<p>Wipe a user account from all credentials and identitying information, and sets it as deleted.</p>
<p><code class="param">#UserID</code> is the ID of the user/player.</p>
<p><code class="param">@Username</code> is the username.</p>
<p><code class="param">Character</code> is the name of a character owned by the user.</p>
<p>Example: <code>wipe user @jane_doe</code></p>`;

/**
 * WipeUser wipes and deletes a user account.
 */
class WipeUser {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'player',
			'cmdLists',
			'helpOverseer',
			'api',
			'confirm',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('wipe', {
			key: 'user',
			next: [
				new IDStep('userId', {
					name: "user ID",
					else: new DelimStep("@", {
						next: new TextStep('username', {
							name: "username",
							token: 'listitem',
							spellcheck: false,
						}),
						else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
							textId: 'charName',
							name: "user",
							errRequired: step => ({ code: 'wipeUser.userRequired', message: "Which user do you want to wipe?" }),
						}),
					}),
				}),
			],
			value: (ctx, p) => this._wipeUser(ctx, p),
		});

		this.module.helpOverseer.addTopic({
			id: 'wipeUser',
			cmd: 'wipe user',
			usage: l10n.l('wipeUser.usage', usageText),
			shortDesc: l10n.l('wipeUser.shortDesc', shortDesc),
			desc: l10n.l('wipeUser.helpText', helpText),
			sortOrder: 400,
		});
	}

	_wipeUser(ctx, p) {
		let mod = this.module.player;
		return (p.username
			? this.module.api.call('identity.overseer', 'getUserByUsername', { username: p.username.trim() })
			: (p.userId
				? Promise.resolve({ id: p.userId })
				: mod.getPlayer().call('getUser', p.charId
					? { charId: p.charId }
					: { charName: p.charName },
				)
			).then(user => this.module.api.get('identity.user.' + user.id))
		).then(identity => {
			identity = identity.toJSON();
			this.module.confirm.open(() => this.module.api.call('identity.overseer', 'wipeUser', { userId: identity.id }).then(result => {
				this.module.charLog.logInfo(ctx.char, l10n.l('wipeUser.teleportNodeDeleted', 'Successfully wiped user "{name}".', identity));
			}).catch(err => {
				this.module.charLog.logError(ctx.char, err);
			}), {
				title: l10n.l('wipeUser.confirmWipe', "Confirm wipe"),
				body: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('wipeUser.wipeUserBody', "Do you really wish to wipe the user account?"), { tagName: 'p' })),
					n.elem('p', [ n.component(new Txt(identity.name + (identity.email ? ' <' + identity.email + '>' : ''), { className: 'dialog--strong' })) ]),
					n.elem('p', { className: 'dialog--error' }, [
						n.component(new FAIcon('exclamation-triangle')),
						n.html("&nbsp;&nbsp;"),
						n.component(new Txt(l10n.l('wipeUser.wipeWarning', "All identifiable data will be cleared."))),
					]),
				])),
				confirm: l10n.l('wipeUser.wipeUser', "Wipe user"),
			});
		});
	}
}

export default WipeUser;
