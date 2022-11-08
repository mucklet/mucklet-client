import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';

const usageText = 'set char <span class="param">Character</span> : <span class="param">Attribute</span> <span class="opt">=</span> <span class="param">Value</span>';
const shortDesc = 'Set an attribute of another character';
const helpText =
`<p>Set an attribute of another character.</p>
<p><code class="param">Character</code> is the name of the character to set.</p>`;


/**
 * SetChar adds command to set character attributes.
 */
class SetChar {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.helpTopic = null;
		this.charAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});

		this.module.cmd.addPrefixCmd('set', {
			key: 'char',
			next: [
				new ListStep('charId', this.module.cmdLists.getAllChars(), {
					textId: 'charName',
					name: "character",
					errRequired: step => ({ code: 'transferChar.characterRequired', message: "What character do you want to set?" }),
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.charAttr, {
					name: "character attribute",
					token: 'attr',
				}),
			],
			value: this._exec.bind(this),
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		next = next || [
			new DelimStep("=", { errRequired: null }),
			attr.stepFactory
				? attr.stepFactory(this.module)
				: new TextStep('value', {
					name: attr.name || attr.key,
				}),
		];
		let item = Object.assign({}, attr, { next });
		this.charAttr.addItem(item);

		if (this.charAttr.length && !this.helpTopic) {
			this.helpTopic = this.app.getModule('helpAdmin');
			if (this.helpTopic) {
				this.helpTopic.addTopic({
					id: 'setChar',
					cmd: 'set char',
					usage: l10n.l('setChar.usage', usageText),
					shortDesc: l10n.l('setChar.shortDesc', shortDesc),
					desc: () => helpAttribDesc(l10n.t('setChar.helpText', helpText), this.charAttr.getItems()),
					sortOrder: 200,
				});
			}
		}

		return this;
	}

	_exec(ctx, p) {
		let f = p.attr;
		return typeof f == 'function'
			? f(ctx, p, this)
			: this.setChar(ctx, p);
	}

	setChar(ctx, p) {
		return ctx.player.call('setChar', Object.assign({
			[p.attr]: p.value,
		}, p.charId	? { charId: p.charId } : { charName: p.charName })).then(result => {
			let c = result.char;
			this.module.charLog.logInfo(ctx.char, l10n.l('setChar.updatedCharacterAttribute', "Attribute for {charName} successfully set.", { charName: (c.name + " " + c.surname).trim() }));
		});
	}
}

export default SetChar;
