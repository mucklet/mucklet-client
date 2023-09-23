import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';
import helpAttribDesc from 'utils/helpAttribDesc';

const usageText = 'set user <span class="param">@Username<span class="comment">/</span>User\'s Character</span> : <span class="param">Attribute</span> <span class="opt">=</span> <span class="param">Value</span>';
const shortDesc = 'Set a user account attribute';
const helpText =
`<p>Set an account attribute for a user.</p>
<p><code class="param">@Username</code> is the account username.</p>
<p><code class="param">User's Character</code> is the character name of any of the characters owned by the user on this realm.</p>`;

const defaultAttr = [
	{
		key: 'name',
		name: "account name",
		desc: l10n.l('setUser.nameDesc', "Account display name."),
		sortOrder: 10,
	},
	{
		key: 'username',
		name: "login username",
		desc: l10n.l('setUser.usernameDesc', "Account username."),
		sortOrder: 20,
	},
	{
		key: 'email',
		name: "user email",
		desc: l10n.l('setUser.emailDesc', "Account email."),
		sortOrder: 30,
	},
	{
		key: 'emailVerified',
		stepFactory: (module) => new ListStep('value', module.cmdLists.getBool(), {
			name: "email verified flag",
		}),
		desc: l10n.l('setUser.emailVerifiedDesc', "Flag telling if user email is verified."),
		sortOrder: 40,
	},
];

/**
 * SetUser sets a user account property.
 */
class SetUser {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'cmdLists', 'api', 'helpOverseer' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.userAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'user',
			next: [
				new DelimStep("@", {
					next: new TextStep('username', {
						name: "username",
						token: 'listitem',
						regex: /^[^:]+/,
						spellcheck: false,
					}),
					else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
						textId: 'charName',
						name: "user",
						errRequired: step => new Err('setUser.characterRequired', "Which user?"),
					}),
				}),
				new DelimStep(":"),
				new ListStep('attr', this.userAttr, {
					name: "account attribute",
					token: 'attr',
				}),
			],
			value: (ctx, p) => typeof p.attr == 'function'
				? p.attr(ctx, p)
				: this._setUser(ctx, p),
		});

		this.module.helpOverseer.addTopic({
			id: 'setUser',
			cmd: 'set user',
			usage: l10n.l('setUser.usage', usageText),
			shortDesc: l10n.l('setUser.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setUser.helpText', helpText), this.userAttr.getItems()),
			sortOrder: 210,
		});
	}

	addAttribute(attr) {
		this.userAttr.addItem(Object.assign({
			next: attr.next || [
				new DelimStep("=", { errRequired: null }),
				attr.stepFactory
					? attr.stepFactory(this.module)
					: new TextStep('value', {
						name: attr.name || attr.key,
					}),
			],
		}, attr));
		return this;
	}

	_setUser(ctx, p) {
		let mod = this.module.player;
		return (p.username
			? this.module.api.call('identity.overseer', 'getUserByUsername', { username: p.username.trim() })
			: mod.getPlayer().call('getUser', p.charId
				? { charId: p.charId }
				: { charName: p.charName },
			)
		)
			.then(user => this.module.api.call('identity.user.' + user.id, 'set', { [p.attr]: p.value }))
			.then(() => {
				this.module.charLog.logInfo(ctx.char, l10n.l('setUser.updatedUserAccount', "Updated user account."));
			});
	}

	getPlayerAttr() {
		return this.userAttr;
	}
}

export default SetUser;
