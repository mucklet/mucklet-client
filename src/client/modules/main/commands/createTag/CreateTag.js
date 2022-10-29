import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import ValueStep from 'classes/ValueStep';
import { keyRegex } from 'utils/regex';
import { descriptionTooLong, keyTooLong } from 'utils/cmdErr';

const usageText = 'create tag <span class="param">Keyword</span><span class="opt">:<span class="param">Preference</span></span> <span class="opt">= <span class="param">Description</span></span>';
const shortDesc = 'Create a custom character tag';
const helpText =
`<p>Create a custom character tag.</p>
<p><code class="param">Keyword</code> is the keyword for the tag.</p>
<p><code class="param">Preference</code> is the optional tag preference. May be <code>like</code> (default) or <code>dislike</code>.</p>
<p><code class="param">Description</code> is the optional tag description.</p>`;

/**
 * CreateTag adds command to create a custom character tag.
 */
class CreateTag {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help', 'api', 'tags', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('create', {
			key: 'tag',
			next: [
				new TextStep('key', {
					regex: keyRegex,
					name: "tag keyword",
					maxLength: () => this.module.info.getTag().tagKeyMaxLength,
					errTooLong: keyTooLong,
				}),
				new DelimStep(":", {
					next: new ListStep('pref', this.module.tags.getPreferenceList(), {
						name: "preference flag",
						else: new ValueStep('pref', "like")
					}),
					errRequired: null
				}),
				new DelimStep("=", {
					next: [
						new TextStep('desc', {
							maxLength: () => this.module.info.getTag().tagDescMaxLength,
							errTooLong: descriptionTooLong,
							errRequired: null
						})
					],
					errRequired: null
				})
			],
			value: (ctx, p) => this.createTag(ctx.char, {
				key: p.key,
				desc: p.desc,
				pref: p.pref
			})
		});

		this.module.help.addTopic({
			id: 'createTag',
			category: 'tags',
			cmd: 'create tag',
			usage: l10n.l('createTag.usage', usageText),
			shortDesc: l10n.l('createTag.shortDesc', shortDesc),
			desc: l10n.l('createTag.helpText', helpText),
			sortOrder: 50,
		});
	}

	createTag(char, params) {
		return this.module.api.call('tag.char.' + char.id + '.tags', 'create', params).then(tag => {
			this.module.charLog.logInfo(char, l10n.l('createTag.createdTag', "Created custom tag [{tagKey}].", { tagKey: tag.key }));
		});
	}
}

export default CreateTag;
