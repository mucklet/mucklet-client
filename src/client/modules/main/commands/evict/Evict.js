import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';
import DelimStep from 'classes/DelimStep';
import helpAttribDesc from 'utils/helpAttribDesc';

const usageText = 'evict <span class="param">Character</span> <span class="opt">: <span class="param">Type</span> <span class="opt">=</span> <span class="param">Value</span></span>';
const shortDesc = 'Evict a registered character';
const helpText =
`<p>Evict a character previously registered. If <code class="param">Type</code> is omitted, the character will be evicted from the <code>home</code> and/or <code>teleport</code> of current room.</p>
<p><code class="param">Character</code> is the name of the character to evict.</p>`;

/**
 * Evict adds the evict command.
 */
class Evict {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'cmdLists', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.evictType = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});

		this.module.cmd.addCmd({
			key: 'evict',
			next: [
				new ListStep('charId', this.module.cmdLists.getAllChars(), {
					textId: 'charName',
					name: "character",
					errRequired: step => ({ code: 'evict.characterRequired', message: "Who do you want to evict?" }),
				}),
				new DelimStep(":", {
					next: new ListStep('type', this.evictType, {
						name: "type of eviction",
						token: 'attr',
					}),
					errRequired: null,
				}),
			],
			value: (ctx, p) => {
				let f = p.type;
				return typeof f == 'function'
					? f(ctx, p, this)
					: this.evict(ctx.char, p.charId
						? { charId: p.charId }
						: { charName: p.charName },
					);
			},
		});

		this.module.help.addTopic({
			id: 'evict',
			category: 'regulate',
			cmd: 'evict',
			usage: l10n.l('evict.usage', usageText),
			shortDesc: l10n.l('evict.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('evict.helpText', helpText), this.evictType.getItems(), {
				attribute: l10n.l('evict.type', "Type"),
				value: '',
			}),
			sortOrder: 30,
		});
	}

	addType(type) {
		let next = (type.nextFactory ? type.nextFactory(this.module) : type.next) || null;
		this.evictType.addItem(Object.assign({}, type, { next }));
		return this;
	}

	evict(char, params) {
		return char.call('evict', params).then(result => {
			let tc = result.targetChar;
			this.module.charLog.logInfo(char, l10n.l('evict.charEvicted', "Successfully evicted {targetCharName} from this room.", {
				targetCharName: (tc.name + " " + tc.surname).trim(),
			}));
		});
	}
}

export default Evict;
