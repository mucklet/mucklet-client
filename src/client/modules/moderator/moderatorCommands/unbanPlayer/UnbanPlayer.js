import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';
import Err from 'classes/Err';

const usageText = 'unban player <span class="param">@Username<span class="comment">/</span>Character</span>';
const shortDesc = 'Unban a previously banned player';
const helpText =
`<p>Unban a previously banned player, allowing them to connect to the realm.</p>
<p>A moderator action will be added to an existing report. If a report doesn't exist for the character, one will be created and assigned to you.</p>
<p><code class="param">@Username</code> is the username of the player. Admins only.</p>
<p><code class="param">Character</code> is the name of a character owned by the player.</p>
<p>Example: <code>unban player Jane Innocent</code></p>`;

/**
 * BanPlayer bans a player.
 */
class BanPlayer {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'cmdLists', 'helpModerate', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('unban', {
			key: 'player',
			next: [
				new DelimStep("@", {
					next: new TextStep('username', {
						name: "username",
						token: 'listitem',
						spellcheck: false,
					}),
					else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
						textId: 'charName',
						name: "player",
						errRequired: step => new Err('unbanPlayer.characterRequired', "Which player?"),
					}),
				}),
			],
			value: (ctx, p) => this._unbanPlayer(ctx, p),
		});

		this.module.helpModerate.addTopic({
			id: 'unbanPlayer',
			cmd: 'unban player',
			usage: l10n.l('unbanPlayer.usage', usageText),
			shortDesc: l10n.l('unbanPlayer.shortDesc', shortDesc),
			desc: l10n.l('unbanPlayer.helpText', helpText),
			sortOrder: 110,
		});
	}

	_unbanPlayer(ctx, p) {
		return (p.username
			? this.module.api.call('identity.overseer', 'getUserByUsername', { username: p.username.trim() }).then(user => ({ playerId: user.id }))
			: Promise.resolve(p.charId
				? { charId: p.charId }
				: { charName: p.charName },
			)
		).then(params => ctx.player.call('unbanPlayer', params).then(() => {
			this.module.charLog.logInfo(ctx.char, l10n.l('unbanPlayer.unbanSuccessful', "Successfully unbanned player."));
		}));
	}
}

export default BanPlayer;
