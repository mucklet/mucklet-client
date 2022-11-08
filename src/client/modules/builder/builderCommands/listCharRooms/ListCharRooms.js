import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

/**
 * ListCharRooms adds command to list rooms owned by a character.
 */
class ListCharRooms {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'listChar', 'player', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.listChar.getItemList().addItem({
			key: 'rooms',
			alias: [ 'room' ],
			value: (ctx, p) => this.listCharRooms(ctx.char, p),
			desc: l10n.l('listCharRooms', "Rooms owned by the character."),
			sortOrder: 10,
		});
	}

	listCharRooms(char, params) {
		return this.module.player.getPlayer().call('getChar', params)
			.then(c => this.module.api.get('core.char.' + c.id + '.rooms').then(rooms => {
				let owned = [];
				for (let m of rooms) {
					owned.push('<tr><td><code>#' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml(m.name) + '</td></tr>');
				}
				if (owned.length) {
					this.module.charLog.logComponent(char, 'listCharRooms', new Elem(n => n.elem('div', { className: 'listrooms charlog--pad' }, [
						n.component(new Txt(l10n.l('listCharRooms.roomsOwnedBy', "Rooms owned by {charName}", { charName: (c.name + " " + c.surname).trim() }), { tagName: 'h4', className: 'charlog--pad' })),
						n.elem('div', { className: 'charlog--code' }, [
							n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
								n.component(new Html('<tr><th class="charlog--strong">' +
									escapeHtml(l10n.t('listCharRooms.room', "Room ID")) +
									'</th><th class="charlog--strong">' +
									escapeHtml(l10n.t('listCharRooms.id', "Room")) +
									'</th></tr>', { tagName: 'thead' },
								)),
								n.component(new Html(owned.join(''), { tagName: 'tbody' })),
							]),
						]),
					])));
				} else {
					this.module.charLog.logInfo(char, l10n.l('listCharRooms.noRooms', "{name} owns no rooms yet.", c));
				}
			}));
	}
}

export default ListCharRooms;
