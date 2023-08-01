import l10n from 'modapp-l10n';
import RepeatStep from 'classes/RepeatStep';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import ValueStep from 'classes/ValueStep';
// import TokenList from 'classes/TokenList';
// import { tagTokenRegex } from 'utils/regex';

const usageText = 'add tag <span class="param">Keyword</span><span class="opt">:<span class="param">Preference</span></span> <span class="opt">, <span class="param">Keyword</span><span class="opt">:<span class="param">Preference</span></span></span><span class="comment">...</span>';
const shortDesc = 'Add one or more predefined tags to the character';
const helpText =
`<p>Add one or more predefined tags to the character. Each keyword should be separated by a comma.</p>
<p><code class="param">Keyword</code> is the keyword for the tag.</p>
<p><code class="param">Preference</code> is the optional tag preference. May be <code>like</code> (default) or <code>dislike</code>.</p>
<p>Example: <code>add tag public, ic, whispers:dislike</code></p>`;

/**
 * AddTag adds command to add a tag to a character.
 */
class AddTag {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help', 'tags', 'api', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		// // Tags list where already added tags are removed
		// this.tagsList = new TokenList(() => {
		// 	let c = this.module.player.getActiveChar();
		// 	let p = (c && c.tags && c.tags.props) || {};
		// 	let m = {};
		// 	Object.keys(p).map(k => m[p[k].id] = true);
		// 	return this.module.tags.getTagsCollection().toArray().filter(tag => !m[tag.id]);
		// }, {
		// 	regex: tagTokenRegex,
		// 	expandRegex: { left: /\w\s/, right: /\w\s/ },
		// 	isMatch: (t, key) => key === t.key ? { key, value: t.id } : false,
		// 	isPrefix: (t, prefix) => !prefix || t.key.substring(0, prefix.length) === prefix
		// 		? t.key
		// 		: null
		// });

		this.module.cmd.addPrefixCmd('add', {
			key: 'tag',
			next: [
				new RepeatStep(
					'keys',
					(next, idx) => new ListStep('tagId-' + idx, this.module.tags.getTagsList(), {
						name: "tag to add",
						next: [
							new DelimStep(":", {
								next: new ListStep('type-' + idx, this.module.tags.getPreferenceList(), { name: "preference flag" }),
								else: new ValueStep('type-' + idx, "like"),
							}),
							next,
						],
					}),
					{
						delimiter: ",",
					},
				),
			],
			value: (ctx, p) => {
				let tags = {};
				let i = 0;
				while (p['tagId-' + i]) {
					tags[p['tagId-' + i]] = p['type-' + i] || 'like';
					i++;
				}
				return this.addTag(ctx.char, tags);
			},
		});

		this.module.help.addTopic({
			id: 'addTag',
			category: 'tags',
			cmd: 'add tag',
			usage: l10n.l('addTag.usage', usageText),
			shortDesc: l10n.l('addTag.shortDesc', shortDesc),
			desc: l10n.l('addTag.helpText', helpText),
			sortOrder: 30,
		});
	}

	addTag(char, tags) {
		return this.module.api.call('tag.char.' + char.id + '.tags', 'setTags', { tags }).then(result => {
			this.module.charLog.logInfo(char, l10n.l('addTag.tagsAdded', "Added tags."));
		});
	}
}

export default AddTag;
