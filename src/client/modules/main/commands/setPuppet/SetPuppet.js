import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';
import { descriptionTooLong } from 'utils/cmdErr';

const usageText = 'set puppet <span class="param">Attribute</span> <span class="opt">=</span> <span class="param">Value</span>';
const shortDesc = 'Set a puppet attribute';
const helpText =
`<p>Set a puppet specific attribute.</p>`;

const defaultAttr = [
	{
		key: 'howtoplay',
		stepFactory: module => new TextStep('value', {
			name: "how to play puppet",
			maxLength: () => module.info.getCore().descriptionMaxLength,
			errTooLong: descriptionTooLong,
			spanLines: true
		}),
		desc: l10n.l('setPuppet.howToPlayDesc', "Information on how to play the puppet. It may be formatted and span multiple paragraphs."),
		sortOrder: 10
	}
];

/**
 * SetPuppet adds command to set extended puppet attributes.
 */
class SetPuppet {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.puppetAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key)
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'puppet',
			next: new ListStep('attr', this.puppetAttr, {
				name: "puppet attribute",
				token: 'attr'
			}),
			value: this.setPuppet.bind(this)
		});

		this.module.help.addTopic({
			id: 'setPuppet',
			category: 'puppets',
			cmd: 'set puppet',
			usage: l10n.l('setPuppet.usage', usageText),
			shortDesc: l10n.l('setPuppet.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setPuppet.helpText', helpText), this.puppetAttr.getItems()),
			sortOrder: 200,
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		if (!next) {
			next = attr.stepFactory
				? attr.stepFactory(this.module)
				: new TextStep('value', {
					name: attr.name || attr.key
				});
			next = Array.isArray(next) ? next : [ next ];
			next.unshift(new DelimStep("=", { errRequired: null }));
		}
		this.puppetAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	setPuppet(ctx, p) {
		return ctx.char.call('setPuppet', {
			[p.attr]: p.value
		}).then(() => {
			this.module.charLog.logInfo(ctx.char, l10n.l('setPuppet.updatedPuppet', "Puppet attribute was successfully set."));
		});
	}
}

export default SetPuppet;
