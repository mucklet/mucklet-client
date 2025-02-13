import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';
import Err from 'classes/Err';
import sha256, { hmacsha256, publicPepper } from 'utils/sha256';

const usageText = 'create userlogin <span class="param">#UserID<span class="comment">/</span>Character</span> = <span class="param">Username</span> : <span class="param">Password</span>';
const shortDesc = 'Creates a user login for an account';
const helpText =
`<p>Creates a user login for an account currently without a username/password login.</p>
<p><code class="param">#UserID</code> is the ID of the user/player.</p>
<p><code class="param">Character</code> is the name of a character owned by the user.</p>
<p><code class="param">Username</code> is the username for the login.</p>
<p><code class="param">Password</code> is the password for the login.</p>`;
const examples = [
	{ cmd: 'create userlogin Jane Doe = janedoe : YourSecret', desc: l10n.l('createUserLogin.createUserLoginCharDesc', "Creates a user login for character Jane Doe's account") },
];

/**
 * CreateUserLogin creates a user login for a user account with no login.
 */
class CreateUserLogin {
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

		this.module.cmd.addPrefixCmd('create', {
			key: 'userlogin',
			next: [
				new IDStep('userId', {
					name: "user ID",
					else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
						textId: 'charName',
						name: "user",
						errRequired: step => new Err('createUserLogin.userRequired', "Which user do you want to create a login for?"),
					}),
				}),
				new DelimStep("="),
				new TextStep('username', {
					name: "username",
					token: 'listitem',
					regex: /^[^:]+/,
					spellcheck: false,
				}),
				new DelimStep(":"),
				new TextStep('password', {
					name: "password",
					token: 'listitem',
					spellcheck: false,
					errRequired: step => new Err('createUserLogin.passwordRequired', "Which temporary password do you want to use?"),
				}),
			],
			value: (ctx, p) => this._createUserLogin(ctx, p),
		});

		this.module.helpOverseer.addTopic({
			id: 'createUserLogin',
			cmd: 'create userlogin',
			usage: l10n.l('createUserLogin.usage', usageText),
			shortDesc: l10n.l('createUserLogin.shortDesc', shortDesc),
			desc: l10n.l('createUserLogin.helpText', helpText),
			examples,
			sortOrder: 410,
		});
	}

	_createUserLogin(ctx, p) {
		let mod = this.module.player;
		return (p.userId
			? Promise.resolve({ id: p.userId })
			: mod.getPlayer().call('getUser', p.charId
				? { charId: p.charId }
				: { charName: p.charName },
			)
		).then(user => this.module.api.call('identity.overseer', 'createUserLogin', {
			userId: user.id,
			username: p.username.trim(),
			pass: sha256(p.password.trim()),
			hash: hmacsha256(p.password.trim(), publicPepper),
		})).then(() => {
			this.module.charLog.logInfo(ctx.char, l10n.l('createUserLogin.createdUserLogin', "Successfully created user login for account."));
		});
	}
}

export default CreateUserLogin;
