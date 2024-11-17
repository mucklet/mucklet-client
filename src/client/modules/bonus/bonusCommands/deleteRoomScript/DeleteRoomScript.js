import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';

const usageText = 'delete roomscript <span class="param">Keyword<span class="comment">/</span>#Script ID</span>';
const shortDesc = 'Delete a room script';
const helpText =
`<p>Delete a room script.</p>
<p><code class="param">Keyword</code> is the keyword for the room script.</p>
<p><code class="param">#ScriptID</code> is the ID of the script.</p>`;

/**
 * DeleteRoomScript adds command to delete a room script.
 */
class DeleteRoomScript {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'help',
			'roomAccess',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('delete', {
			key: 'roomscript',
			next: [
				new IDStep('scriptId', {
					name: "script key or ID",
					else: new ListStep('scriptId', this.module.roomAccess.getInRoomScriptTokens(), {
						name: "room script",
					}),
				}),
			],
			value: (ctx, p) => this.deleteRoomScript(ctx.char, {
				scriptId: p.scriptId,
			}),
		});

		this.module.help.addTopic({
			id: 'deleteRoomScript',
			category: 'buildRooms',
			cmd: 'delete roomscript',
			usage: l10n.l('deleteRoomScript.usage', usageText),
			shortDesc: l10n.l('deleteRoomScript.shortDesc', shortDesc),
			desc: l10n.l('deleteRoomScript.helpText', helpText),
			sortOrder: 250,
		});
	}

	deleteRoomScript(char, params) {
		return char.call('deleteRoomScript', params)
			.then(result => this.module.charLog.logInfo(char, l10n.l('deleteRoomScript.roomScriptDeleted', "Deleted room script \"{key}\".", result.script)));
	}
}

export default DeleteRoomScript;
