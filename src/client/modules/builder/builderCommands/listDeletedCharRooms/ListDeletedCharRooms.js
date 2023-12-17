import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';
import formatDateTime from 'utils/formatDateTime';

/**
 * ListDeletedCharRooms adds command to list deleted rooms owned by a character.
 */
class ListDeletedCharRooms {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'listDeletedChar',
			'player',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.listDeletedChar.getItemList().addItem({
			key: 'rooms',
			alias: [ 'room' ],
			value: (ctx, p) => this.listDeletedCharRooms(ctx.char, p),
			desc: l10n.l('listDeletedCharRooms', "Rooms owned by the character."),
			sortOrder: 10,
		});
	}

	listDeletedCharRooms(ctrl, params) {
		let player = this.module.player.getPlayer();
		return player.call('getChar', params)
			.then(c => player.call('getDeletedCharRooms', { charId: c.id }).then(result => {
				let { char, deletedRooms } = result;
				let rows = [];
				for (let m of deletedRooms) {
					rows.push('<tr><td><code>#' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml(m.name) + '</td><td>' + escapeHtml(formatDateTime(new Date(m.deleted))) + '</td></tr>');
				}
				if (rows.length) {
					this.module.charLog.logComponent(ctrl, 'listDeletedCharRooms', new Elem(n => n.elem('div', { className: 'listrooms charlog--pad' }, [
						n.component(new Txt(l10n.l('listDeletedCharRooms.roomsOwnedBy', "Deleted rooms owned by {charName}", { charName: (char.name + " " + char.surname).trim() }), { tagName: 'h4', className: 'charlog--pad' })),
						n.elem('div', { className: 'charlog--code' }, [
							n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
								n.component(new Html('<tr><th class="charlog--strong">' +
									escapeHtml(l10n.t('listDeletedCharRooms.roomId', "Room ID")) +
									'</th><th class="charlog--strong">' +
									escapeHtml(l10n.t('listDeletedCharRooms.room', "Room")) +
									'</th><th class="charlog--strong">' +
									escapeHtml(l10n.t('listDeletedCharRooms.deleted', "Deleted")) +
									'</th></tr>', { tagName: 'thead' },
								)),
								n.component(new Html(rows.join(''), { tagName: 'tbody' })),
							]),
						]),
					])));
				} else {
					this.module.charLog.logInfo(ctrl, l10n.l('listDeletedCharRooms.noRooms', "{name} owns no deleted rooms.", c));
				}
			}));
	}
}

export default ListDeletedCharRooms;
