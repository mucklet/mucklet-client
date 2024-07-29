import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import Err from 'classes/Err';
import escapeHtml from 'utils/escapeHtml';
import formatDateTime from 'utils/formatDateTime';
import './listRoomScripts.scss';

const usageText = 'list roomscripts';
const shortDesc = "List the room's scripts";
const helpText =
`<p>Get a list of the room's scripts.</p>
<p>Alias: <code>list roomscript</code></p>`;

const errAccessDenied = new Err('listScripts.accessToScriptsDenied', "You must own the room to list room scripts.");

/**
 * ListRoomScripts adds command to list all scripts of current room.
 */
class ListRoomScripts {
	constructor(app) {
		this.app = app;

		this.app.require([
			'api',
			'cmd',
			'charLog',
			'help',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'roomscripts',
			alias: [ 'roomscript' ],
			value: (ctx, p) => this.listRoomScripts(ctx.char),
		});

		this.module.help.addTopic({
			id: 'listRoomScripts',
			category: 'buildRooms',
			cmd: 'list roomscripts',
			alias: [ 'list roomscript' ],
			usage: l10n.l('listRoomScripts.usage', usageText),
			shortDesc: l10n.l('listRoomScripts.shortDesc', shortDesc),
			desc: l10n.l('listRoomScripts.helpText', helpText),
			sortOrder: 220,
		});
	}

	listRoomScripts(char, attr) {
		let room = char.inRoom;
		return this.module.api.get('core.room.' + room.id + '.scripts').then(scripts => {
			let rows = [];
			for (let m of scripts) {
				rows.push('<tr>' +
					'<td><code>#' + escapeHtml(m.id) + '</code></td>' +
					'<td>' + escapeHtml(m.key) + '</td>' +
					'<td>' + escapeHtml(formatDateTime(new Date(m.updated))) + '</td>' +
					'<td><i class="fa fa-circle listroomscripts-' + (m.active ? 'active' : 'inactive') + '" aria-hidden></i></td>' +
					'</tr>',
				);
			}
			if (rows.length) {
				this.module.charLog.logComponent(char, 'listRoomScripts', new Elem(n => n.elem('div', { className: 'listscripts charlog--pad' }, [
					n.component(new Txt(l10n.l('listRoomScripts.roomScripts', "Room scripts"), { tagName: 'h4', className: 'charlog--pad' })),
					n.elem('div', { className: 'charlog--code' }, [
						n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
							n.component(new Html('<tr><th class="charlog--strong">' +
								escapeHtml(l10n.t('listRoomScripts.scriptId', "Script ID")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('listRoomScripts.key', "Key")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('listRoomScripts.updated', "Updated")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('listRoomScripts.active', "Active")) +
								'</th></tr>', { tagName: 'thead' },
							)),
							n.component(new Html(rows.join(''), { tagName: 'tbody' })),
						]),
					]),
				])));
			} else {
				this.module.charLog.logInfo(char, l10n.l('listRoomScripts.noRoomScripts', "{roomName} has no room scripts.", { roomName: room.name }));
			}
		}).catch(err => {
			if (err.code == 'system.accessDenied') {
				err = errAccessDenied;
			}
			this.module.charLog.logError(char, err);
		});
	}
}

export default ListRoomScripts;
