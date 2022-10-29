import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import ItemList from 'classes/ItemList';

const usageText = 'remove player <span class="param">Player\'s Character<span class="comment">/</span>#PlayerID</span> : role <span class="opt">=</span> <span class="param">Role</span>';
const shortDesc = 'Remove a role from a player';
const helpText =
`<p>Remove a role from a player.</p>
<p><code class="param">Player's Character</code> is the name of any of the characters owned by the player.</p>
<p><code class="param">#PlayerID</code> is the ID of the player.</p>
<p><code class="param">Role</code> is the role to remove. May be <code>helper</code>, <code>moderator</code>, <code>builder</code>, or <code>admin</code>.</p>
<p>Example: <code>remove player Jane Doe : role = moderator</code></p>`;

/**
 * RemovePlayerRole removes a role from a player.
 */
class RemovePlayerRole {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'cmdLists', 'helpAdmin', 'api' ], this._init.bind(this));
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
							]
						}), {
							name: "player role",
							token: 'text'
						})
					],
				},
			]
		});

		this.module.cmd.addPrefixCmd('remove', {
			key: 'player',
			next: [
				new IDStep('playerId', {
					name: "player's character name or player ID",
					else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
						textId: 'charName',
						name: "player",
						errRequired: step => ({ code: 'removePlayerRole.characterRequired', message: "Which player (by character)?" })
					}),
				}),
				new DelimStep(":"),
				new ListStep('attr', this.playerAttr, {
					name: "player list attribute",
					token: 'attr'
				}),
			],
			value: (ctx, p) => this["_removePlayer" + p.attr](ctx, p)
		});

		this.module.helpAdmin.addTopic({
			id: 'removePlayerRole',
			cmd: 'remove player role',
			usage: l10n.l('removePlayerRole.usage', usageText),
			shortDesc: l10n.l('removePlayerRole.shortDesc', shortDesc),
			desc: l10n.l('removePlayerRole.helpText', helpText),
			sortOrder: 240,
		});
	}

	_removePlayerRole(ctx, p) {
		let player = this.module.player.getPlayer();
		return player.call('getUser', p).then(user => player.call('removePlayerRole', {
			playerId: user.id,
			role: p.value
		})).then(() => {
			this.module.charLog.logInfo(ctx.char, l10n.l('removePlayerRole.removedRoleToPlayer', "Removed role from player."));
		});
	}
}

export default RemovePlayerRole;
