import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import NumberStep from 'classes/NumberStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';
import { itemNameTooLong } from 'utils/cmdErr';

const usageText = 'set taggroup <span class="param">Keyword</span> : <span class="param">Attribute</span> = <span class="param">Value</span>';
const shortDesc = 'Set a tag group attribute';
const helpText =
`<p>Set a tag group attribute.</p>
<p><code class="param">Keyword</code> is the keyword for the group.</p>`;

const defaultAttr = [
	{
		key: 'name',
		stepFactory: module => new TextStep('value', {
			name: "group name",
			maxLength: () => module.info.getTag().groupNameMaxLength,
			errTooLong: itemNameTooLong,
		}),
		desc: l10n.l('setTagGroup.nameDesc', "Name of the group."),
		sortOrder: 10,
	},
	{
		key: 'order',
		stepFactory: () => new NumberStep('value', {
			name: "sort order",
		}),
		desc: l10n.l('setTagGroup.orderDesc', "Sort order value. Must be 0 (zero) or greater."),
		sortOrder: 20,
	},
];

/**
 * SetTagGroup adds command to set tag group attributes.
 */
class SetTagGroup {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'tags', 'charLog', 'helpAdmin', 'api', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.groupAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'taggroup',
			next: [
				new ListStep('key', this.module.tags.getGroupsList(), {
					name: "tag group",
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.groupAttr, {
					name: "group attribute",
					token: 'attr',
				}),
			],
			value: (ctx, p) => {
				return this.setTagGroup(ctx.char, p.key, {
					[p.attr]: p.value,
				});
			},
		});

		this.module.helpAdmin.addTopic({
			id: 'setTagGroup',
			cmd: 'set taggroup',
			usage: l10n.l('setTagGroup.usage', usageText),
			shortDesc: l10n.l('setTagGroup.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setTagGroup.helpText', helpText), this.groupAttr.getItems()),
			sortOrder: 450,
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
		this.groupAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	setTagGroup(char, key, params) {
		return this.module.api.call('tag.group.' + key.toLowerCase(), 'set', params)
			.then(result => this.module.charLog.logInfo(char, l10n.l('setTagGroup.groupAttributeSet', "Successfully set attribute of tag group [{key}].", { key: result.group.key })));
	}
}

export default SetTagGroup;
