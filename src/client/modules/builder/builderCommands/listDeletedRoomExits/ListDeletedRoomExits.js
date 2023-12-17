import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';
import formatDateTime from 'utils/formatDateTime';

/**
 * ListDeletedRoomExits adds command to list deleted exits belonging to a room.
 */
class ListDeletedRoomExits {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'listDeletedRoom',
			'player',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.listDeletedRoom.getItemList().addItem({
			key: 'exits',
			alias: [ 'exit' ],
			value: (ctx, p) => this.listDeletedRoomExits(ctx.char, p),
			desc: l10n.l('listDeletedRoomExits', "Exits belonging to the room."),
			sortOrder: 10,
		});
	}

	listDeletedRoomExits(ctrl, params) {
		let player = this.module.player.getPlayer();
		return player.call('getDeletedRoomExits', { roomId: params.roomId || ctrl.inRoom.id }).then(result => {
			let { room, deletedExits } = result;
			let rows = [];
			for (let m of deletedExits) {
				rows.push('<tr><td><code>#' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml(m.name) + '</td><td>' + escapeHtml(formatDateTime(new Date(m.deleted))) + '</td></tr>');
			}
			if (rows.length) {
				this.module.charLog.logComponent(ctrl, 'listDeletedRoomExits', new Elem(n => n.elem('div', { className: 'listexits charlog--pad' }, [
					n.component(new Txt(l10n.l('listDeletedRoomExits.exitsOwnedBy', "Deleted exits from {name}", room), { tagName: 'h4', className: 'charlog--pad' })),
					n.elem('div', { className: 'charlog--code' }, [
						n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
							n.component(new Html('<tr><th class="charlog--strong">' +
								escapeHtml(l10n.t('listDeletedRoomExits.exitId', "Exit ID")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('listDeletedRoomExits.name', "Exit")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('listDeletedRoomExits.deleted', "Deleted")) +
								'</th></tr>', { tagName: 'thead' },
							)),
							n.component(new Html(rows.join(''), { tagName: 'tbody' })),
						]),
					]),
				])));
			} else {
				this.module.charLog.logInfo(ctrl, l10n.l('listDeletedRoomExits.noExits', "{name} has no deleted exits.", room));
			}
		});
	}
}

export default ListDeletedRoomExits;
