import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import { itemNameTooLong } from 'utils/cmdErr';

const usageText = 'create area <span class="param">Name</span>';
const shortDesc = 'Create a new area';
const helpText =
`<p>Create a new area that your rooms can belong to.</p>
<p><code class="param">Name</code> is the name of the area.</p>`;

/**
 * CreateArea adds command to create a new area.
 */
class CreateArea {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('create', {
			key: 'area',
			next: [
				new TextStep('name', {
					errRequired: () => ({ code: 'createArea.nameRequired', message: "What should the area be called?" }),
					maxLength: () => module.info.getCore().itemNameMaxLength,
					errTooLong: itemNameTooLong,
				}),
			],
			value: (ctx, p) => this.createArea(ctx.char, {
				name: (p.name || '').trim(),
			}),
		});

		this.module.help.addTopic({
			id: 'createArea',
			category: 'buildAreas',
			cmd: 'create area',
			usage: l10n.l('createArea.usage', usageText),
			shortDesc: l10n.l('createArea.shortDesc', shortDesc),
			desc: l10n.l('createArea.helpText', helpText),
			sortOrder: 10,
		});
	}

	createArea(char, params) {
		return char.call('createArea', params).then(area => {
			this.module.charLog.logInfo(char, l10n.l('createArea.areaCreated', "Created area \"{name}\".", { name: area.name }));
		});
	}
}

export default CreateArea;
