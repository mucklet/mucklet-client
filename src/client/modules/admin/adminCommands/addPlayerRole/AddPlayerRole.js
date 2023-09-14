import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';

const usageText = 'add player <span class="param">Player\'s Character<span class="comment">/</span>#PlayerID</span> : role <span class="opt">=</span> <span class="param">Role</span>';
const shortDesc = 'Add a role to a player';
const helpText =
`<p>Add a role to a player.</p>
<p><code class="param">Player's Character</code> is the name of any of the characters owned by the player.</p>
<p><code class="param">#PlayerID</code> is the ID of the player.</p>
<p><code class="param">Role</code> is the role to add. May be <code>helper</code>, <code>moderator</code>, <code>builder</code>, or <code>admin</code>.</p>
<p>Example: <code>add player Jane Doe : role = moderator</code></p>`;

/**
 * AddPlayerRole adds a role to a player.
 */
class AddPlayerRole {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'cmdLists', 'api', 'helpAdmin' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.playerAttr = new ItemList({
			items: [
				{
					key: 'role',
					value: 'Role',
					next: [
						new DelimStep("=", { errRequired: null }),
						new ListStep('value', new ItemList({
							items: [
								{ key: "helper" },
								{ key: "moderator" },
								{ key: "builder" },
								{ key: "admin" },
							],
						}), {
							name: "player role",
							token: 'text',
						}),
					],
				},
			],
		});

		this.module.cmd.addPrefixCmd('add', {
			key: 'player',
			next: [
				new IDStep('playerId', {
					name: "player's character name or player ID",
					else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
						textId: 'charName',
						name: "player",
						errRequired: step => new Err('addPlayerRole.characterRequired', "Which player (by character)?"),
					}),
				}),
				new DelimStep(":"),
				new ListStep('attr', this.playerAttr, {
					name: "player list attribute",
					token: 'attr',
				}),
			],
			value: (ctx, p) => this["_addPlayer" + p.attr](ctx, p),
		});

		this.module.helpAdmin.addTopic({
			id: 'addPlayerRole',
			cmd: 'add player role',
			usage: l10n.l('addPlayerRole.usage', usageText),
			shortDesc: l10n.l('addPlayerRole.shortDesc', shortDesc),
			desc: l10n.l('addPlayerRole.helpText', helpText),
			sortOrder: 230,
		});
	}

	_addPlayerRole(ctx, p) {
		let player = this.module.player.getPlayer();
		return player.call('getUser', p).then(user => player.call('addPlayerRole', {
			playerId: user.id,
			role: p.value,
		})).then(() => {
			this.module.charLog.logInfo(ctx.char, l10n.l('addPlayerRole.addedRoleToPlayer', "Added role to player."));
		});
	}
}

export default AddPlayerRole;
