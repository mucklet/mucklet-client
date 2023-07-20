import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import ValueStep from 'classes/ValueStep';
import ItemList from 'classes/ItemList';
import TokenList from 'classes/TokenList';
import { isResError } from 'resclient';
import { tagTokenRegex, tagExpandRegex } from 'utils/regex';
import helpAttribDesc from 'utils/helpAttribDesc';
import { keyRegex } from 'utils/regex';
import { descriptionTooLong, keyTooLong } from 'utils/cmdErr';

const usageText = 'set tag <span class="param">Keyword</span> : <span class="param">Attribute</span> = <span class="param">Value</span>';
const shortDesc = 'Set a character tag attribute';
const helpText =
`<p>Set a character tag attribute.</p>
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
		desc: l10n.l('setTag.keywordDesc', "Tag keyword. Only allowed for custom tags."),
		sortOrder: 10,
	},
	{
		key: 'desc',
		stepFactory: module => new ValueStep('value', "", {
			next: new TextStep('value', {
				name: "tag description",
				maxLength: () => module.info.getTag().tagDescMaxLength,
				errTooLong: descriptionTooLong,
				errRequired: null,
			}),
		}),
		desc: l10n.l('setTag.descDesc', "Description of the tag. Only allowed for custom tags."),
		sortOrder: 20,
	},
	{
		key: 'preference',
		value: 'pref',
		stepFactory: module => new ListStep('value', module.tags.getPreferenceList(), {
			name: "preference",
		}),
		desc: l10n.l('setTag.prefDesc', "Tag preference. May be <code>like</code> or <code>dislike</code>"),
		sortOrder: 30,
	},
];

/**
 * SetTag adds command to set tag attributes.
 */
class SetTag {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help', 'api', 'player', 'tags', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.tagAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.tagsList = new TokenList(() => {
			let c = this.module.player.getActiveChar();
			let p = (c && c.tags && c.tags.props) || {};
			return Object.keys(p)
				.map(k => p[k])
				.filter(t => !isResError(t))
				.sort((a, b) => a.key.localeCompare(b.key) || a.id.localeCompare(b.id));
		}, {
			regex: tagTokenRegex,
			expandRegex: tagExpandRegex,
			isMatch: (t, key) => key === t.key ? { key, value: t.id } : false,
			isPrefix: (t, prefix) => !prefix || t.key.substring(0, prefix.length) === prefix
				? t.key
				: null,
		});

		this.module.cmd.addPrefixCmd('set', {
			key: 'tag',
			next: [
				new ListStep('tagId', this.tagsList, {
					name: "tag",
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.tagAttr, {
					name: "tag attribute",
					token: 'attr',
				}),
			],
			value: (ctx, p) => p.attr == 'pref'
				? this.setTagPref(ctx.char, p.tagId, p.value)
				: this.setTag(ctx.char, p.tagId, {
					[p.attr]: p.value,
				}),
		});

		this.module.help.addTopic({
			id: 'setTag',
			category: 'tags',
			cmd: 'set tag',
			usage: l10n.l('setTag.usage', usageText),
			shortDesc: l10n.l('setTag.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setTag.helpText', helpText), this.tagAttr.getItems()),
			sortOrder: 60,
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

	setTag(char, tagId, params) {
		return this.module.api.call('tag.tag.' + tagId, 'set', params)
			.then(result => this.module.charLog.logInfo(char, l10n.l('setTag.tagAttributeSet', "Successfully set attribute of tag [{tagKey}].", { tagKey: result.tag.key })));
	}

	setTagPref(char, tagId, pref) {
		return this.module.api.call('tag.char.' + char.id + '.tags', 'setTags', { tags: { [tagId]: pref || 'like' }})
			.then(() => this.module.charLog.logInfo(char, l10n.l('setTag.tagPreferenceSet', "Successfully set preference of tag")));
	}
}

export default SetTag;
