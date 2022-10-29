import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import IDStep from 'classes/IDStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';

const usageText = 'set player <span class="param">Player\'s Character<span class="comment">/</span>#PlayerID</span> : <span class="param">Attribute</span> <span class="opt">=</span> <span class="param">Value</span>';
const shortDesc = 'Set a player account attribute';
const helpText =
`<p>Set an attribute of a player.</p>
<p><code class="param">Player's Character</code> is the name of any of the characters owned by the player.</p>
<p><code class="param">#PlayerID</code> is the ID of the player.</p>`;

const defaultAttr = [
	{
		key: 'trusted',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "is trusted flag" }),
		desc: l10n.l('setPlayer.trustedDesc', "Flag telling if the player is trusted to play unrestricted. Value is <code>yes</code> or <code>no</code>."),
		sortOrder: 10
	},
];

/**
 * SetPlayer sets a player property.
 */
class SetPlayer {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'cmdLists', 'helpModerate' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.playerAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key)
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'player',
			next: [
				new IDStep('playerId', {
					name: "player's character name or player ID",
					else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
						textId: 'charName',
						name: "player",
						errRequired: step => ({ code: 'addPlayerRole.characterRequired', message: "Which player (by character)?" })
					}),
				}),
				new DelimStep(":"),
				new ListStep('attr', this.playerAttr, {
					name: "account attribute",
					token: 'attr'
				}),
			],
			value: (ctx, p) => typeof p.attr == 'function'
				? p.attr(ctx, p)
				: this._setPlayer(ctx, p)
		});

		this.module.helpModerate.addTopic({
			id: 'setPlayer',
			cmd: 'set player',
			usage: l10n.l('setPlayer.usage', usageText),
			shortDesc: l10n.l('setPlayer.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setPlayer.helpText', helpText), this.playerAttr.getItems()),
			sortOrder: 90,
		});
	}

	addAttribute(attr) {
		this.playerAttr.addItem(Object.assign({
			next: attr.next || [
				new DelimStep("=", { errRequired: null }),
				attr.stepFactory
					? attr.stepFactory(this.module)
					: new TextStep('value', {
						name: attr.name || attr.key
					})
			]
		}, attr));
		return this;
	}

	_setPlayer(ctx, p) {
		let o = p.playerId
			? { playerId: p.playerId }
			: p.charId
				? { charId: p.charId }
				: { charName: p.charName };
		o[p.attr] = p.value;
		return ctx.player.call('setPlayer', o)
			.then(() => {
				this.module.charLog.logInfo(ctx.char, l10n.l('setPlayer.updatedPlayerAttribute', "Updated player attribute."));
			});
	}

	getPlayerAttr() {
		return this.playerAttr;
	}
}

export default SetPlayer;
