import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';

const usageText = 'add user <span class="param">@Username<span class="comment">/</span>#UserID<span class="comment">/</span>Character</span> : title <span class="opt">=</span> <span class="param">Title</span>';
const shortDesc = 'Add a title to a user';
const helpText =
`<p>Add a title to a user.</p>
<p><code class="param">@Username</code> is the username.</p>
<p><code class="param">#UserID</code> is the ID of the user.</p>
<p><code class="param">Character</code> is the name of a character owned by the user.</p>
<p><code class="param">Title</code> is the title to add. May be <code>overseer</code>, <code>pioneer</code>, or <code>supporter</code>.</p>
<p>Example: <code>add user Jane Doe : title = pioneer</code></p>`;

/**
 * AddUserTitle adds a title to a user.
 */
class AddUserTitle {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'cmdLists', 'api', 'helpOverseer' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.userAttr = new ItemList({
			items: [
				{
					key: 'title',
					value: 'Title',
					next: [
						new DelimStep("=", { errRequired: null }),
						new ListStep('value', new ItemList({
							items: [
								{ key: "overseer" },
								{ key: "pioneer" },
								{ key: "supporter" },
							]
						}), {
							name: "user title",
							token: 'text'
						})
					],
				},
			]
		});

		this.module.cmd.addPrefixCmd('add', {
			key: 'user',
			next: [
				new DelimStep("@", {
					next: new TextStep('username', {
						name: "username",
						token: 'listitem',
						spellcheck: false
					}),
					else: new IDStep('userId', {
						name: "user's character name or user ID",
						else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
							textId: 'charName',
							name: "user",
							errRequired: step => ({ code: 'getUser.userRequired', message: "Which user?" })
						}),
					}),
				}),
				new DelimStep(":"),
				new ListStep('attr', this.userAttr, {
					name: "user list attribute",
					token: 'attr'
				}),
			],
			value: (ctx, p) => this["_addUser" + p.attr](ctx, p)
		});

		this.module.helpOverseer.addTopic({
			id: 'addUserTitle',
			cmd: 'add user title',
			usage: l10n.l('addUserTitle.usage', usageText),
			shortDesc: l10n.l('addUserTitle.shortDesc', shortDesc),
			desc: l10n.l('addUserTitle.helpText', helpText),
			sortOrder: 220,
		});
	}

	_addUserTitle(ctx, p) {
		let mod = this.module.player;
		return (p.username
			? this.module.api.call('identity.overseer', 'getUserByUsername', { username: p.username.trim() })
			: (p.userId
				? this.module.api.call('identity.overseer', 'getUserById', { userId: p.userId })
				: mod.getPlayer().call('getUser', p.charId
					? { charId: p.charId }
					: { charName: p.charName }
				).then(user => this.module.api.get('identity.user.' + user.id))
			)
		).then(user => {
			return this.module.api.call('identity.overseer', 'addUserIdRole', {
				userId: user.id,
				idRole: p.value
			}).then(() => {
				this.module.charLog.logInfo(ctx.char, l10n.l('addUserTitle.addedTitleToUserName', "Added title to user {name}.", { name: user.name }));
			});
		});
	}
}

export default AddUserTitle;
