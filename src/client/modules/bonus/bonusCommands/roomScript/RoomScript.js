import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';

const usageText = 'roomscript <span class="param">Keyword<span class="comment">/</span>#Script ID</span>';
const shortDesc = "Show content of a room script";
const helpText =
`<p>Show the source code content of a room script.</p>
<p><code class="param">Keyword</code> is the keyword for the script.</p>
<p><code class="param">#ScriptID</code> is the ID of the script.</p>`;

/**
 * RoomScript adds the room script command.
 */
class RoomScript {
	constructor(app) {
		this.app = app;

		this.app.require([
			'api',
			'cmd',
			'help',
			'charLog',
			'roomAccess',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'roomscript',
			next: new IDStep('scriptId', {
				name: "script key or ID",
				else: new ListStep('scriptId', this.module.roomAccess.getInRoomScriptTokens(), {
					name: "room script",
				}),
			}),
			value: (ctx, p) => this.roomScript(ctx.char, p.scriptId, true),
		});

		this.module.help.addTopic({
			id: 'roomScript',
			category: 'buildRooms',
			cmd: 'roomscript',
			usage: l10n.l('roomScript.usage', usageText),
			shortDesc: l10n.l('roomScript.shortDesc', shortDesc),
			desc: l10n.l('roomScript.helpText', helpText),
			sortOrder: 200,
		});
	}

	roomScript(char, scriptId, safe) {
		return char.call('useRoomScript', { scriptId, safe })
			.then(result => {
				this.module.charLog.logInfo(char, l10n.l('roomScript.changedToRoomScript', "Changed room to script \"{scriptName}\".", { scriptName: result.script.name }));
				return result;
			})
			.catch(err => {
				if (err.code != 'core.roomScriptNotStored') {
					return Promise.reject(err);
				}

				return this.module.api.get('core.roomscript.' + scriptId).then(script => new Promise((resolve, reject) => {
					let cb = { resolve, reject };
					// Confirm to overwrite current appearance
					this.module.confirm.open(() => this.roomScript(char, scriptId, false).then(result => {
						cb && cb.resolve(result);
					}, err => cb && cb.reject(err)).then(() => cb = null), {
						title: l10n.l('roomScript.discardChanges', "Discard changes"),
						body: new Elem(n => n.elem('div', [
							n.component(new Txt(l10n.l('roomScript.discardChangesBody', "Current appearance is not stored in any room script. Do you wish to apply this script?"), { tagName: 'p' })),
							n.component(script ? new ModelTxt(script, m => m.name, { tagName: 'p', className: 'dialog--strong' }) : null),
							n.elem('p', { className: 'dialog--error' }, [
								n.component(new FAIcon('exclamation-triangle')),
								n.html("&nbsp;&nbsp;"),
								n.component(new Txt(l10n.l('roomScript.discardWarning', "Changes made to the room's appearance will be lost."))),
							]),
						])),
						confirm: l10n.l('roomScript.applyRoomScript', "Apply script"),
						onClose: () => {
							if (cb) {
								cb.resolve(null);
							}
							cb = null;
						},
					});
				}));
			});
	}
}

export default RoomScript;
