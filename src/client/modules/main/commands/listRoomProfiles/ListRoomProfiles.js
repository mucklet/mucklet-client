import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import Err from 'classes/Err';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'list roomprofiles';
const shortDesc = "List the room's profiles";
const helpText =
`<p>Get a list of the room's profiles.</p>
<p>Alias: <code>list roomprofile</code></p>`;

const errAccessDenied = new Err('listProfiles.accessToProfilesDenied', "You must own the room to list room profiles.");

/**
 * ListRoomProfiles adds command to list all profiles of current room.
 */
class ListRoomProfiles {
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
			key: 'roomprofiles',
			alias: [ 'roomprofile' ],
			value: (ctx, p) => this.listRoomProfiles(ctx.char),
		});

		this.module.help.addTopic({
			id: 'listRoomProfiles',
			category: 'buildRooms',
			cmd: 'list roomprofiles',
			alias: [ 'list roomprofile' ],
			usage: l10n.l('listRoomProfiles.usage', usageText),
			shortDesc: l10n.l('listRoomProfiles.shortDesc', shortDesc),
			desc: l10n.l('listRoomProfiles.helpText', helpText),
			sortOrder: 120,
		});
	}

	listRoomProfiles(char, attr) {
		let room = char.inRoom;
		return this.module.api.get('core.room.' + room.id + '.profiles').then(profiles => {
			let list = [];
			for (let m of profiles) {
				list.push('<tr><td><code>roomprofile ' + escapeHtml(m.key) + '</code></td><td>' + escapeHtml(m.name) + '</td></tr>');
			}
			if (list.length) {
				this.module.charLog.logComponent(char, 'listRoomProfiles', new Elem(n => n.elem('div', { className: 'listprofiles charlog--pad' }, [
					n.component(new Txt(l10n.l('listRoomProfiles.roomProfiles', "Room profiles"), { tagName: 'h4', className: 'charlog--pad' })),
					n.elem('div', { className: 'charlog--code' }, [
						n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
							n.component(new Html(list.join(''), { tagName: 'tbody' })),
						]),
					]),
				])));
			} else {
				this.module.charLog.logInfo(char, l10n.l('listRoomProfiles.noRoomProfiles', "{roomName} has no room profiles.", { roomName: room.name }));
			}
		}).catch(err => {
			if (err.code == 'system.accessDenied') {
				err = errAccessDenied;
			}
			this.module.charLog.logError(char, err);
		});
	}
}

export default ListRoomProfiles;
