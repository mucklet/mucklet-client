import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import Err from 'classes/Err';
import FAIcon from 'components/FAIcon';

const usageText = 'delete useropenid <span class="param">#UserID<span class="comment">/</span>Character</span>';
const shortDesc = 'Deletes OpenID from a user account';
const helpText =
`<p>Deletes the registered OpenID from a user account.</p>
<p><code class="param">#UserID</code> is the ID of the user/player.</p>
<p><code class="param">Character</code> is the name of a character owned by the user.</p>`;
const examples = [
	{ cmd: 'delete useropenid Jane Doe', desc: l10n.l('deleteUserOpenId.deleteUserOpenIdCharDesc', "Deletes the OpenID registered to Jane Doe's user account") },
];

/**
 * DeleteUserOpenID deletes the registered OpenID from a user account.
 */
class DeleteUserOpenID {
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

		this.module.cmd.addPrefixCmd('delete', {
			key: 'useropenid',
			next: [
				new IDStep('userId', {
					name: "user ID",
					else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
						textId: 'charName',
						name: "user",
						errRequired: step => new Err('deleteUserOpenId.userRequired', "Which user do you want to delete the OpenID from?"),
					}),
				}),
			],
			value: (ctx, p) => this._deleteUserOpenId(ctx, p),
		});

		this.module.helpOverseer.addTopic({
			id: 'deleteUserOpenId',
			cmd: 'delete useropenid',
			usage: l10n.l('deleteUserOpenId.usage', usageText),
			shortDesc: l10n.l('deleteUserOpenId.shortDesc', shortDesc),
			desc: l10n.l('deleteUserOpenId.helpText', helpText),
			examples,
			sortOrder: 420,
		});
	}

	_deleteUserOpenId(ctx, p) {
		let mod = this.module.player;
		return (p.userId
			? Promise.resolve({ id: p.userId })
			: mod.getPlayer().call('getUser', p.charId
				? { charId: p.charId }
				: { charName: p.charName },
			)
		).then(user => this.module.api.get('identity.user.' + user.id))
			.then(identity => {
				identity = identity.toJSON();
				this.module.confirm.open(() => this.module.api.call('identity.overseer', 'deleteUserOpenId', { userId: identity.id }).then(result => {
					this.module.charLog.logInfo(ctx.char, l10n.l('deleteUserOpenId.openIdDeleted', 'Successfully deleted OpenID from user "{name}".', identity));
				}).catch(err => {
					this.module.charLog.logError(ctx.char, err);
				}), {
					title: l10n.l('deleteUserOpenId.confirmOpenIdDelete', "Confirm OpenID delete"),
					body: new Elem(n => n.elem('div', [
						n.component(new Txt(l10n.l('deleteUserOpenId.deleteUserOpenIdBody', "Do you really wish to delete OpenID from user account?"), { tagName: 'p' })),
						n.elem('p', [ n.component(new Txt(identity.name + (identity.email ? ' <' + identity.email + '>' : ''), { className: 'dialog--strong' })) ]),
						n.elem('p', { className: 'dialog--error' }, [
							n.component(new FAIcon('exclamation-triangle')),
							n.html("&nbsp;&nbsp;"),
							n.component(new Txt(l10n.l('deleteUserOpenId.deleteOpenIdWarning', "Deletion cannot be undone."))),
						]),
					])),
					confirm: l10n.l('deleteUserOpenId.deleteUserOpenId', "Delete OpenID"),
				});
			});
	}
}

export default DeleteUserOpenID;
