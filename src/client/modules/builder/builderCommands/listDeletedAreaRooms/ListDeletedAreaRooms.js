import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import Err from 'classes/Err';
import escapeHtml from 'utils/escapeHtml';
import formatDateTime from 'utils/formatDateTime';

/**
 * ListDeletedAreaRooms adds command to list deleted rooms belonging to an area.
 */
class ListDeletedAreaRooms {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'listDeletedArea',
			'player',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.listDeletedArea.getItemList().addItem({
			key: 'rooms',
			alias: [ 'room' ],
			value: (ctx, p) => this.listDeletedAreaRooms(ctx.char, p),
			desc: l10n.l('listDeletedAreaRooms', "Rooms belonging to the area."),
			sortOrder: 10,
		});
	}

	listDeletedAreaRooms(ctrl, params) {
		let player = this.module.player.getPlayer();
		let areaId = params.areaId || ctrl.inRoom.area?.id;
		if (!areaId) {
			return Promise.reject(new Err('listDeletedAreaRooms.missingArea', "Current room does not belong to an area."));
		}

		return player.call('getDeletedAreaRooms', { areaId }).then(result => {
			let { area, deletedRooms } = result;
			let rows = [];
			for (let m of deletedRooms) {
				rows.push('<tr><td><code>#' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml(m.name) + '</td><td>' + escapeHtml(formatDateTime(new Date(m.deleted))) + '</td></tr>');
			}
			if (rows.length) {
				this.module.charLog.logComponent(ctrl, 'listDeletedAreaRooms', new Elem(n => n.elem('div', { className: 'listrooms charlog--pad' }, [
					n.component(new Txt(l10n.l('listDeletedAreaRooms.roomsOwnedBy', "Deleted rooms belonging to {name}", area), { tagName: 'h4', className: 'charlog--pad' })),
					n.elem('div', { className: 'charlog--code' }, [
						n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
							n.component(new Html('<tr><th class="charlog--strong">' +
								escapeHtml(l10n.t('listDeletedAreaRooms.roomId', "Room ID")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('listDeletedAreaRooms.room', "Room")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('listDeletedAreaRooms.deleted', "Deleted")) +
								'</th></tr>', { tagName: 'thead' },
							)),
							n.component(new Html(rows.join(''), { tagName: 'tbody' })),
						]),
					]),
				])));
			} else {
				this.module.charLog.logInfo(ctrl, l10n.l('listDeletedAreaRooms.noRooms', "{name} has no deleted room.", area));
			}
		});
	}
}

export default ListDeletedAreaRooms;
