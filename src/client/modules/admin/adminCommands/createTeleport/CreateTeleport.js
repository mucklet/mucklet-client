import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import { keyTooLong } from 'utils/cmdErr';

const usageText = 'create teleport <span class="param">Keyword</span>';
const shortDesc = 'Create a new global teleport destination';
const helpText =
`<p>Create a new global teleport destination to the current room.</p>
<p><code class="param">Keyword</code> is the keyword to use for the teleport destination.</p>`;

/**
 * CreateTeleport adds command to create a new global teleport destination.
 */
class CreateTeleport {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'helpAdmin', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('create', {
			key: 'teleport',
			next: [
				new DelimStep("=", { errRequired: null }),
				new TextStep('key', {
					regex: /^[\w\s]*\w/,
					maxLength: () => this.module.info.getCore().keyMaxLength,
					errTooLong: keyTooLong,
					name: "global teleport destination keyword"
				})
			],
			value: (ctx, p) => this.createTeleport(ctx.char, {
				roomId: ctx.char.inRoom.id,
				key: p.key
			})
		});

		this.module.helpAdmin.addTopic({
			id: 'createTeleport',
			cmd: 'create teleport',
			usage: l10n.l('createTeleport.usage', usageText),
			shortDesc: l10n.l('createTeleport.shortDesc', shortDesc),
			desc: l10n.l('createTeleport.helpText', helpText),
			sortOrder: 110,
		});
	}

	createTeleport(char, params) {
		return char.call('createTeleport', params).then(result => {
			this.module.charLog.logInfo(char, l10n.l('createTeleport.createdTeleportNode', "Created global teleport destination to {roomName}.", { roomName: result.room.name }));
		});
	}
}

export default CreateTeleport;
