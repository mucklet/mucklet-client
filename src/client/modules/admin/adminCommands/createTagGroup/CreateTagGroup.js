import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import NumberStep from 'classes/NumberStep';
import { keyRegex } from 'utils/regex';
import { itemNameTooLong, keyTooLong } from 'utils/cmdErr';

const usageText = 'create taggroup <span class="param">Keyword</span> <span class="opt">: <span class="param">Order</span></span> = <span class="param">Name</span>';
const shortDesc = 'Create a new group for global tags';
const helpText =
`<p>Create a new group for global tags.</p>
<p><code class="param">Keyword</code> is the keyword for the group.</p>
<p><code class="param">Order</code> is an optional sort order value. Defaults to 0 (zero).</p>
<p><code class="param">Name</code> is the name of the group.</p>`;

/**
 * CreateTagGroup adds command to create a new tag group.
 */
class CreateTagGroup {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'helpAdmin', 'api', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('create', {
			key: 'taggroup',
			next: [
				new TextStep('key', {
					regex: keyRegex,
					name: "keyword",
					maxLength: () => this.module.info.getTag().groupKeyMaxLength,
					errTooLong: keyTooLong,
				}),
				new DelimStep(":", {
					next: new NumberStep('order', { name: "sort order" }),
					errRequired: null
				}),
				new DelimStep("=", {
					next: [
						new TextStep('name', {
							maxLength: () => module.info.getTag().groupNameMaxLength,
							errTooLong: itemNameTooLong,
						})
					]
				})
			],
			value: (ctx, p) => this.createTagGroup(ctx.char, {
				key: p.key,
				name: p.name || "",
				order: p.order || 0
			})
		});

		this.module.helpAdmin.addTopic({
			id: 'createTagGroup',
			cmd: 'create taggroup',
			usage: l10n.l('createTagGroup.usage', usageText),
			shortDesc: l10n.l('createTagGroup.shortDesc', shortDesc),
			desc: l10n.l('createTagGroup.helpText', helpText),
			sortOrder: 430,
		});
	}

	createTagGroup(char, params) {
		return this.module.api.call('tag.groups', 'create', params).then(tag => {
			this.module.charLog.logInfo(char, l10n.l('createTagGroup.createdTagGroup', `Created tag group "{name}" ({key}).`, { name: tag.name, key: tag.key }));
		});
	}
}

export default CreateTagGroup;
