import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'delete taggroup <span class="param">Keyword</span>';
const shortDesc = 'Delete a tag group';
const helpText =
`<p>Delete a tag group.</p>
<p><code class="param">Keyword</code> is the keyword for the group.</p>`;

/**
 * DeleteTagGroup adds command to delete a tag group.
 */
class DeleteTagGroup {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'tags', 'charLog', 'helpAdmin', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('delete', {
			key: 'taggroup',
			next: [
				new ListStep('key', this.module.tags.getGroupsList(), {
					name: "group to delete",
				}),
			],
			value: (ctx, p) => this.deleteTagGroup(ctx.char, p.key),
		});

		this.module.helpAdmin.addTopic({
			id: 'deleteTagGroup',
			cmd: 'delete taggroup',
			usage: l10n.l('deleteTagGroup.usage', usageText),
			shortDesc: l10n.l('deleteTagGroup.shortDesc', shortDesc),
			desc: l10n.l('deleteTagGroup.helpText', helpText),
			sortOrder: 450,
		});
	}

	deleteTagGroup(char, key) {
		return this.module.api.call('tag.group.' + key, 'delete')
			.then(result => this.module.charLog.logInfo(char, l10n.l('deleteTagGroup.tagGroupDeleted', `Deleted tag group "{name}" ({key}).`, result.group)));
	}
}

export default DeleteTagGroup;
