import l10n from 'modapp-l10n';
import sha256, { hmacsha256, publicPepper } from 'utils/sha256';

/**
 * SetUserPassword sets user account password.
 */
class SetUserPassword {
	constructor(app) {
		this.app = app;

		this.app.require([ 'charLog', 'setUser', 'api', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.setUser.addAttribute({
			key: 'password',
			name: "user password",
			desc: l10n.l('setUserPassword.passwordDesc', "User login password."),
			value: this._setUserPassword.bind(this),
			sortOrder: 100
		});
	}

	_setUserPassword(ctx, p) {
		let mod = this.module.player;
		return (p.username
			? Promise.resolve({ username: p.username })
			: mod.getPlayer().call('getUser', p.charId
				? { charId: p.charId }
				: { charName: p.charName }
			).then(user => ({ userId: user.id }))
		).then(o => this.module.api.call('identity.overseer', 'resetPassword', Object.assign(o, {
			newPass: sha256(p.value.trim()),
			newHash: hmacsha256(p.value.trim(), publicPepper)
		})).then(() => {
			this.module.charLog.logInfo(ctx.char, l10n.l('setUser.updatedUserAccountPassword', "Updated user account password."));
		}));
	}
}

export default SetUserPassword;
