import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import { keyTooLong, scriptTooLong } from 'utils/cmdErr';

const usageText = 'create roomscript <span class="param">Keyword</span> = <span class="param">Script</span>';
const shortDesc = 'Create a room script';
const helpText =
`<p>Create a room script. For more information, see the room scripting resources.</p>
<p><code class="param">Keyword</code> is the keyword to use for the script.</p>
<p><code class="param">Script</code> is the LUA room script.</p>`;

/**
 * CreateRoomScript adds command to create a room script.
 */
class CreateRoomScript {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'help',
			'info',
			'createLimits',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('create', {
			key: 'roomscript',
			next: [
				new TextStep('key', {
					regex: /^[\w\s]*\w/,
					name: "script keyword",
					maxLength: () => this.module.info.getCore().keyMaxLength,
					errTooLong: keyTooLong,
				}),
				new DelimStep("=", {
					next: [
						new TextStep('script', {
							name: "room script",
							token: 'code',
							maxLength: () => this.module.info.getCore().scriptMaxLength,
							errTooLong: scriptTooLong,
							errRequired: null,
							spanLines: true,
							spellcheck: false,
						}),
					],
				}),
			],
			value: (ctx, p) => this.createRoomScript(ctx.char, {
				key: p.key,
				script: p.script,
			}),
		});

		this.module.help.addTopic({
			id: 'createRoomScript',
			category: 'buildRooms',
			cmd: 'create roomscript',
			usage: l10n.l('createRoomScript.usage', usageText),
			shortDesc: l10n.l('createRoomScript.shortDesc', shortDesc),
			desc: l10n.l('createRoomScript.helpText', helpText),
			sortOrder: 210,
		});
	}

	createRoomScript(char, params) {
		let errComponent = this.module.createLimits.getCharProfilesError(char);
		if (errComponent) {
			return this.module.charLog.logComponent(char, 'error', errComponent);
		}
		return char.call('createRoomScript', params).then(result => {
		 	this.module.charLog.logInfo(char, l10n.l('createRoomScript.scriptCreated', "Created script \"{scriptKey}\" for room \"{roomName}\".", { scriptKey: result.script.key, roomName: result.room.name }));
		});
	}
}

export default CreateRoomScript;
