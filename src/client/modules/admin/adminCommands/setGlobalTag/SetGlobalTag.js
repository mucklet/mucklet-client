import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import ValueStep from 'classes/ValueStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';
import { keyRegex } from 'utils/regex';
import { descriptionTooLong, keyTooLong } from 'utils/cmdErr';

const usageText = 'set globaltag <span class="param">Keyword</span> : <span class="param">Attribute</span> = <span class="param">Value</span>';
const shortDesc = 'Set a global character tag attribute';
const helpText =
`<p>Set a global character tag attribute.</p>
<p><code class="param">Keyword</code> is the keyword for the tag.</p>`;

const defaultAttr = [
	{
		key: 'keyword',
		value: 'key',
		stepFactory: module => new TextStep('value', {
			regex: keyRegex,
			name: "tag keyword",
			maxLength: () => module.info.getTag().tagKeyMaxLength,
			errTooLong: keyTooLong,
		}),
		desc: l10n.l('setGlobalTag.keywordDesc', "Tag keyword."),
		sortOrder: 10,
	},
	{
		key: 'desc',
		stepFactory: module => new TextStep('value', {
			name: "tag description",
			maxLength: () => module.info.getTag().tagDescMaxLength,
			errTooLong: descriptionTooLong,
			errRequired: null,
		}),
		desc: l10n.l('setGlobalTag.descDesc', "Description of the tag."),
		sortOrder: 20,
	},
	{
		key: 'group',
		stepFactory: module => new ListStep('value', module.tags.getGroupsList(), {
			name: "tag group",
			else: new ValueStep('value', ""),
		}),
		desc: l10n.l('setGlobalTag.groupDesc', "Tag group. Empty means no group. List groups with <code>list taggroups</code>."),
		sortOrder: 30,
	},
	{
		key: 'parent',
		value: 'parentId',
		stepFactory: module => new ListStep('value', module.tags.getTagsList(), {
			name: "parent tag",
			else: new ValueStep('value', ""),
		}),
		desc: l10n.l('setGlobalTag.parentIdDesc', "Parent tag. Empty means no parent. Cyclic relations are not allowed."),
		sortOrder: 40,
	},
];

/**
 * SetGlobalTag adds command to set tag attributes.
 */
class SetGlobalTag {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'tags', 'charLog', 'helpAdmin', 'api', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.tagAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'globaltag',
			next: [
				new ListStep('tagId', this.module.tags.getTagsList(), {
					name: "tag keyword",
				}),
				new DelimStep(":", {
					next: new ListStep('attr', this.tagAttr, {
						name: "tag attribute",
						token: 'attr',
					}),
				}),
			],
			value: (ctx, p) => this.setGlobalTag(ctx.char, p.tagId, {
				[p.attr]: p.value,
			}),
		});

		this.module.helpAdmin.addTopic({
			id: 'setGlobalTag',
			cmd: 'set globaltag',
			usage: l10n.l('setGlobalTag.usage', usageText),
			shortDesc: l10n.l('setGlobalTag.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setGlobalTag.helpText', helpText), this.tagAttr.getItems()),
			sortOrder: 410,
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
		this.tagAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	setGlobalTag(char, tagId, params) {
		return this.module.api.call('tag.tag.' + tagId, 'set', params)
			.then(result => this.module.charLog.logInfo(char, l10n.l('setGlobalTag.tagAttributeSet', "Successfully set attribute of global tag [{tagKey}].", { tagKey: result.tag.key })));
	}
}

export default SetGlobalTag;
