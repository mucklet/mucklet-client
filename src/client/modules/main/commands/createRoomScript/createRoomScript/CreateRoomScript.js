import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import { keyTooLong, scriptTooLong } from 'utils/cmdErr';
import isError from 'utils/isError';
import ScriptCompileError from 'components/ScriptCompileError';

const usageText = 'create roomscript <span class="param">Keyword</span> = <span class="param">Source</span>';
const shortDesc = 'Create a room script';
const helpText =
`<p>Create a room script.</p>
<p>For info on how to active the script, type: <code>help set roomscript</code></p>
<p class="common--formattext">For more information and script examples, see the <a href="https://github.com/mucklet/mucklet-script#readme" target="_blank" rel="noopener noreferrer" title="https://github.com/mucklet/mucklet-script">mucklet-script</a> development resources.</p>
<p><code class="param">Keyword</code> is the keyword to use for the script.</p>
<p><code class="param">Source</code> is the room script source code.</p>`;
const examples = [
	{ cmd: 'create roomscript test = export function onActivate(): void {\n    Room.describe("Hello, world!")\n}', desc: l10n.l('createRoomScript.helloWorldDesc', "Creates a <code>test</code> hello world room script.") },
];

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
						new TextStep('source', {
							name: "source code",
							token: 'code',
							maxLength: () => this.module.info.getCore().scriptMaxLength,
							errTooLong: scriptTooLong,
							errRequired: null,
							spanLines: true,
							trimSpace: false,
							spellcheck: false,
						}),
					],
				}),
			],
			value: (ctx, p) => this.createRoomScript(ctx.char, {
				key: p.key,
				source: p.source,
			}),
		});

		this.module.help.addTopic({
			id: 'createRoomScript',
			category: 'buildRooms',
			cmd: 'create roomscript',
			usage: l10n.l('createRoomScript.usage', usageText),
			shortDesc: l10n.l('createRoomScript.shortDesc', shortDesc),
			desc: l10n.l('createRoomScript.helpText', helpText),
			examples,
			sortOrder: 210,
		});
	}

	createRoomScript(char, params) {
		return char.call('createRoomScript', params).then(result => {
		 	this.module.charLog.logInfo(char, l10n.l('createRoomScript.scriptCreated', "Created script \"{scriptKey}\" for room \"{roomName}\".", { scriptKey: result.script.key, roomName: result.room.name }));
		}).catch(err => {
			if (!isError(err, 'core.compileError')) {
				throw err;
			}
			throw new ScriptCompileError(err);
		});
	}
}

export default CreateRoomScript;
