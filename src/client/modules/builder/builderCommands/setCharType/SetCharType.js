import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';
// import NumberStep from 'classes/NumberStep';
// import DelimStep from 'classes/DelimStep';

const usageText = 'set char <span class="param">Character</span> : type <span class="opt">=</span> <span class="param">Type</span>';
const shortDesc = 'Set character type to puppet or normal. A puppet may be controlled by other characters.';
const helpText =
`<p>Set character type to puppet or normal.</p>
<p><code class="param">Character</code> is the name of the character to set.</p>
<p><code class="param">Type</code> is the character type. May be <code>normal</code>, or <code>puppet</code>.</p>`;


/**
 * SetCharType adds command to set the character's type.
 */
class SetCharType {
	constructor(app) {
		this.app = app;

		this.app.require([ 'setChar', 'charLog', 'helpBuilder' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.charTypes = new ItemList({
			items: [{ key: 'normal', value: 'player' }, { key: 'puppet' }],
		});

		this.module.setChar.addAttribute({
			key: 'type',
			stepFactory: () => new ListStep('value', this.charTypes, { name: "character type" }),
			desc: l10n.l('setCharType.typeDesc', "Character type. Value is <code>normal</code> or <code>puppet</code>."),
			sortOrder: 100,
		});

		this.module.helpBuilder.addTopic({
			id: 'setCharType',
			cmd: 'set char type',
			usage: l10n.l('setCharType.usage', usageText),
			shortDesc: l10n.l('setCharType.shortDesc', shortDesc),
			desc: l10n.t('setCharType.helpText', helpText),
			sortOrder: 20,
		});
	}

	// setCharType(char, params) {
	// 	return char.call('set', Object.assign({ typeId: char.inChar.id, type: 'char' }, params)).then(() => {
	// 		this.module.charLog.logInfo(char, l10n.l('setCharType.charTypeSet', "Char type attribute was successfully set"));
	// 	});
	// }
}

export default SetCharType;
