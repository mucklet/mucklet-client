import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import { keyRegex } from 'utils/regex';
import { descriptionTooLong, keyTooLong } from 'utils/cmdErr';

const usageText = 'create globaltag <span class="param">Keyword</span> <span class="opt">: <span class="param">Group</span></span> <span class="opt">= <span class="param">Description</span></span>';
const shortDesc = 'Create a new global character tag';
const helpText =
`<p>Create a new global character tag.</p>
<p><code class="param">Keyword</code> is the keyword for the tag.</p>
<p><code class="param">Group</code> is the optional tag group.</p>
<p><code class="param">Description</code> is the optional tag description.</p>`;

/**
 * CreateGlobalTag adds command to create a new global tag.
 */
class CreateGlobalTag {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'helpAdmin', 'api', 'tags', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('create', {
			key: 'globaltag',
			next: [
				new TextStep('key', {
					regex: keyRegex,
					name: "global tag keyword",
					maxLength: () => this.module.info.getTag().tagKeyMaxLength,
					errTooLong: keyTooLong,
				}),
				new DelimStep(":", {
					next: new ListStep('group', this.module.tags.getGroupsList(), {
						name: "tag group"
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
			value: (ctx, p) => this.createGlobalTag(ctx.char, {
				key: p.key,
				group: p.group || null,
				desc: p.desc || null
			})
		});

		this.module.helpAdmin.addTopic({
			id: 'createGlobalTag',
			cmd: 'create globaltag',
			usage: l10n.l('createGlobalTag.usage', usageText),
			shortDesc: l10n.l('createGlobalTag.shortDesc', shortDesc),
			desc: l10n.l('createGlobalTag.helpText', helpText),
			sortOrder: 400,
		});
	}

	createGlobalTag(char, params) {
		return this.module.api.call('tag.tags', 'create', params).then(tag => {
			this.module.charLog.logInfo(char, l10n.l('createGlobalTag.createdTag', "Created global tag [{tagKey}].", { tagKey: tag.key }));
		});
	}
}

export default CreateGlobalTag;
