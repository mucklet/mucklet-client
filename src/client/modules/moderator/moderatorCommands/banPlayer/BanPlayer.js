import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import getObjectProperty from 'utils/getObjectProperty';
import helpAttribDesc from 'utils/helpAttribDesc';
import banReasons from 'utils/banReasons';

const usageText = 'ban player <span class="param">@Username<span class="comment">/</span>Character</span> = <span class="param">Reason</span>';
const shortDesc = 'Ban a player from the realm';
const helpText =
`<p>Ban a player from the realm. Everything the player owns will remain, but the player can no longer connect to the realm.</p>
<p><code class="param">@Username</code> is the username of the player. Admins only.</p>
<p><code class="param">Character</code> is the name of a character owned by the player.</p>`;
const examples = [
	`<code>ban player Jane Mischief = underaged</code></p>`,
];

/**
 * BanPlayer bans a player.
 */
class BanPlayer {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'cmdLists', 'helpModerate', 'api', 'confirm', 'toaster' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;


		this.reasons = new ItemList({
			items: Object.keys(banReasons).map((key, i) => ({ key, desc: banReasons[key], order: i })),
			compare: (a, b) => a - b,
		});


		this.module.cmd.addPrefixCmd('ban', {
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
						errRequired: step => ({ code: 'banPlayer.characterRequired', message: "Which player?" }),
					}),
				}),
				new DelimStep("=", {
					next: [
						new ListStep('reason', this.reasons, {
							name: "ban reasons",
							token: 'attr',
						}),
					],
				}),
			],
			value: (ctx, p) => this._banPlayer(ctx, p),
		});

		this.module.helpModerate.addTopic({
			id: 'banPlayer',
			cmd: 'ban player',
			usage: l10n.l('banPlayer.usage', usageText),
			shortDesc: l10n.l('banPlayer.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('banPlayer.helpText', helpText), this.reasons.getItems(), {
				attribute: l10n.l('banPlayer.reasonParams', `<code class="param">Reason</code>`),
				value: "",
			}),
			examples,
			sortOrder: 100,
		});
	}

	_banPlayer(ctx, p) {
		return (p.username
			? this.module.api.call('identity.overseer', 'getUserByUsername', { username: p.username.trim() }).then(user => ({ playerId: user.id }))
			: Promise.resolve(getObjectProperty(p, 'charId', 'charName'))
		).then(params => {
			this.module.confirm.open(() => {
				ctx.player.call('banPlayer', Object.assign({ reason: p.reason }, params)).then(() => {
					this.module.charLog.logInfo(ctx.char, l10n.l('banPlayer.banSuccessful', "Successfully banned player."));
				}).catch(err => this.module.toaster.openError(err));
			}, {
				title: l10n.l('banPlayer.confirmDelete', "Confirm ban"),
				body: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('banPlayer.banPlayerBody', "Do you wish to ban the player?"), { tagName: 'p' })),
				])),
				confirm: l10n.l('banPlayer.ban', "Ban"),
			});
		});
	}
}

export default BanPlayer;
