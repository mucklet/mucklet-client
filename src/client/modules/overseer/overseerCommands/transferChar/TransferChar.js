import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';
import IDStep from 'classes/IDStep';


const usageText = 'transfer char <span class="param">Character</span> = <span class="param">@Username<span class="comment">/</span>Player\'s Character<span class="comment">/</span>#UserID</span>';
const shortDesc = 'Transfer character ownership to another player';
const helpText =
`<p>Transfer character ownership to another player.</p>
<p><code class="param">Character</code> is the name of the character to transfer.</p>
<p><code class="param">@Username</code> is the username of the player to get ownership.</p>
<p><code class="param">#UserID</code> is the ID of the user.</p>
<p><code class="param">Player's Character</code> is the character name of any of the characters owned by the player to get ownership.</p>
<p>Example: <code>transfer char John Doe = @login_42</code></p>`;

/**
 * TransferChar adds the setChar attribute to set the char owner.
 */
class TransferChar {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmdSteps', 'cmd', 'charLog', 'helpOverseer', 'api', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('transfer', {
			key: 'char',
			next: [
				this.module.cmdSteps.newAnyCharStep({
					errRequired: step => ({ code: 'transferChar.characterRequired', message: "What character do you want to transfer ownership of?" }),
				}),
				new DelimStep("="),
				new DelimStep("@", {
					next: new TextStep('username', {
						name: "username",
						token: 'listitem',
						regex: /^[^:]+/,
						spellcheck: false,
					}),
					else: new IDStep('userId', {
						name: "user's character name or user ID",
						else: this.module.cmdSteps.newAnyCharStep({
							id: 'ownerCharId',
							textId: 'ownerCharName',
							name: "user",
							errRequired: step => ({ code: 'getUser.userRequired', message: "Which user?" }),
						}),
					}),
				}),
			],
			value: (ctx, p) => this._transferChar(ctx, p),
		});

		this.module.helpOverseer.addTopic({
			id: 'transferChar',
			cmd: 'transfer char',
			usage: l10n.l('transferChar.usage', usageText),
			shortDesc: l10n.l('transferChar.shortDesc', shortDesc),
			desc: l10n.l('transferChar.helpText', helpText),
			sortOrder: 300,
		});
	}

	_transferChar(ctx, p) {
		let mod = this.module.player;
		return (p.username
			? this.module.api.call('identity.overseer', 'getUserByUsername', { username: p.username.trim() })
			: (p.userId
				? Promise.resolve({ id: p.userId })
				: mod.getPlayer().call('getUser', p.ownerCharId
					? { charId: p.ownerCharId }
					: { charName: p.ownerCharName },
				)
			)
		)
			.then(user => mod.getPlayer().call('transferChar', p.charId
				? { playerId: user.id, charId: p.charId }
				: { playerId: user.id, charName: p.charName },
			))
			.then(result => {
				let c = result.char;
				this.module.charLog.logInfo(ctx.char, l10n.l('transferChar.charTransferred', "Successfully transferred {charName}.", { charName: (c.name + " " + c.surname).trim() }));
			});
	}
}

export default TransferChar;
