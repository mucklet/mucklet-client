import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';
import formatDateTime from 'utils/formatDateTime';

/**
 * ListDeletedCharAreas adds command to list deleted areas owned by a character.
 */
class ListDeletedCharAreas {
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
			key: 'areas',
			alias: [ 'area' ],
			value: (ctx, p) => this.listDeletedCharAreas(ctx.char, p),
			desc: l10n.l('listDeletedCharAreas', "Areas owned by the character."),
			sortOrder: 10,
		});
	}

	listDeletedCharAreas(ctrl, params) {
		let player = this.module.player.getPlayer();
		return player.call('getChar', params)
			.then(c => player.call('getDeletedCharAreas', { charId: c.id }).then(result => {
				let { char, deletedAreas } = result;
				let rows = [];
				for (let m of deletedAreas) {
					rows.push('<tr><td><code>#' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml(m.name) + '</td><td>' + escapeHtml(formatDateTime(new Date(m.deleted))) + '</td></tr>');
				}
				if (rows.length) {
					this.module.charLog.logComponent(ctrl, 'listDeletedCharAreas', new Elem(n => n.elem('div', { className: 'listareas charlog--pad' }, [
						n.component(new Txt(l10n.l('listDeletedCharAreas.areasOwnedBy', "Deleted areas owned by {charName}", { charName: (char.name + " " + char.surname).trim() }), { tagName: 'h4', className: 'charlog--pad' })),
						n.elem('div', { className: 'charlog--code' }, [
							n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
								n.component(new Html('<tr><th class="charlog--strong">' +
									escapeHtml(l10n.t('listDeletedCharAreas.areaId', "Area ID")) +
									'</th><th class="charlog--strong">' +
									escapeHtml(l10n.t('listDeletedCharAreas.area', "Area")) +
									'</th><th class="charlog--strong">' +
									escapeHtml(l10n.t('listDeletedCharAreas.deleted', "Deleted")) +
									'</th></tr>', { tagName: 'thead' },
								)),
								n.component(new Html(rows.join(''), { tagName: 'tbody' })),
							]),
						]),
					])));
				} else {
					this.module.charLog.logInfo(ctrl, l10n.l('listDeletedCharAreas.noAreas', "{name} owns no deleted areas.", c));
				}
			}));
	}
}

export default ListDeletedCharAreas;
