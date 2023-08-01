import l10n from 'modapp-l10n';
import RepeatStep from 'classes/RepeatStep';
import ListStep from 'classes/ListStep';
import TokenList from 'classes/TokenList';
import { isResError } from 'resclient';
import { tagTokenRegex, tagExpandRegex } from 'utils/regex';

const usageText = 'remove tag <span class="param">Keyword</span></span> <span class="opt">, <span class="param">Keyword</span></span><span class="comment">...</span>';
const shortDesc = 'Remove one or more tags from the character';
const helpText =
`<p>Remove one or more tags from the character. Each keyword should be separated by a comma.</p>
<p><code class="param">Keyword</code> is the keyword for the tag to be removed.</p>
<p>Example: <code>remove tag public, ic, whispers</code></p>`;

/**
 * RemoveTag removes command to add a tag to a character.
 */
class RemoveTag {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help', 'player', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

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

		this.module.cmd.addPrefixCmd('remove', {
			key: 'tag',
			next: [
				// new DelimStep("=", { errRequired: null }),
				new RepeatStep(
					'keys',
					(next, idx) => new ListStep('tagId-' + idx, this.tagsList, {
						name: "tag to remove",
						next,
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
					tags[p['tagId-' + i]] = null;
					i++;
				}
				return this.removeTag(ctx.char, tags);
			},
		});

		this.module.help.addTopic({
			id: 'removeTag',
			category: 'tags',
			cmd: 'remove tag',
			usage: l10n.l('removeTag.usage', usageText),
			shortDesc: l10n.l('removeTag.shortDesc', shortDesc),
			desc: l10n.l('removeTag.helpText', helpText),
			sortOrder: 40,
		});
	}

	removeTag(char, tags) {
		return this.module.api.call('tag.char.' + char.id + '.tags', 'setTags', { tags }).then(result => {
		 	this.module.charLog.logInfo(char, l10n.l('removeTag.tagsRemoved', "Removed tags."));
		});
	}
}

export default RemoveTag;
