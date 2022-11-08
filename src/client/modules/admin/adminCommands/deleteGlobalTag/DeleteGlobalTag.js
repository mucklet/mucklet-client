import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'delete globaltag <span class="param">Keyword</span>';
const shortDesc = 'Delete a global character tag';
const helpText =
`<p>Delete a global character tag.</p>
<p><code class="param">Keyword</code> is the keyword for the tag.</p>`;

/**
 * DeleteGlobalTag adds command to delete a global character tag.
 */
class DeleteGlobalTag {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'tags', 'charLog', 'helpAdmin', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('delete', {
			key: 'globaltag',
			next: [
				new ListStep('tagId', this.module.tags.getTagsList(), {
					name: "global tag to delete",
				}),
			],
			value: (ctx, p) => this.deleteGlobalTag(ctx.char, p.tagId),
		});

		this.module.helpAdmin.addTopic({
			id: 'deleteGlobalTag',
			cmd: 'delete globaltag',
			usage: l10n.l('deleteGlobalTag.usage', usageText),
			shortDesc: l10n.l('deleteGlobalTag.shortDesc', shortDesc),
			desc: l10n.l('deleteGlobalTag.helpText', helpText),
			sortOrder: 420,
		});
	}

	deleteGlobalTag(char, tagId) {
		return this.module.api.call('tag.tag.' + tagId, 'delete')
			.then(result => this.module.charLog.logInfo(char, l10n.l('deleteGlobalTag.characterTagDeleted', "Deleted global character tag [{tagKey}].", { tagKey: result.tag.key })));
	}
}

export default DeleteGlobalTag;
