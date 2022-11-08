import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

/**
 * ListCharAreas adds command to list areas owned by a character.
 */
class ListCharAreas {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'listChar', 'player', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.listChar.getItemList().addItem({
			key: 'areas',
			alias: [ 'area' ],
			value: (ctx, p) => this.listCharAreas(ctx.char, p),
			desc: l10n.l('listCharAreas', "Areas owned by the character."),
			sortOrder: 20,
		});
	}

	listCharAreas(char, params) {
		return this.module.player.getPlayer().call('getChar', params)
			.then(c => this.module.api.get('core.char.' + c.id + '.areas').then(areas => {
				let owned = [];
				for (let m of areas) {
					owned.push('<tr><td><code>#' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml(m.name) + '</td></tr>');
				}
				if (owned.length) {
					this.module.charLog.logComponent(char, 'listCharAreas', new Elem(n => n.elem('div', { className: 'listareas charlog--pad' }, [
						n.component(new Txt(l10n.l('listCharAreas.areasOwnedBy', "Areas owned by {charName}", { charName: (c.name + " " + c.surname).trim() }), { tagName: 'h4', className: 'charlog--pad' })),
						n.elem('div', { className: 'charlog--code' }, [
							n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
								n.component(new Html('<tr><th class="charlog--strong">' +
									escapeHtml(l10n.t('listCharAreas.area', "Area ID")) +
									'</th><th class="charlog--strong">' +
									escapeHtml(l10n.t('listCharAreas.id', "Area")) +
									'</th></tr>', { tagName: 'thead' },
								)),
								n.component(new Html(owned.join(''), { tagName: 'tbody' })),
							]),
						]),
					])));
				} else {
					this.module.charLog.logInfo(char, l10n.l('listCharAreas.noAreas', "{name} owns no areas yet.", c));
				}
			}));
	}
}

export default ListCharAreas;
