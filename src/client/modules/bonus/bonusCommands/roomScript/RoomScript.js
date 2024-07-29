import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
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
			value: (ctx, p) => this.roomScript(ctx.char, p.scriptId),
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

	roomScript(char, scriptId) {
		return this.module.api.get(`core.roomscript.${scriptId}.details`).then(script => {
			this.module.charLog.logComponent(char, 'roomScript', new Elem(n => n.elem('div', { className: 'charlog--pad' }, [
				n.component(new Txt(l10n.l('roomScript.worldConfig', "Room script - {scriptKey}", { scriptKey: script.key }), { tagName: 'h4' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('pre', { className: 'common--pre-wrap' }, [ n.text(script.script) ]),
				]),
			])));
		});
	}
}

export default RoomScript;
