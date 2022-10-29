import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'list areas';
const shortDesc = 'List all areas your character owns';
const helpText =
`<p>Get a list of all areas owned by the character.</p>
<p>Alias: <code>list area</code></p>`;

/**
 * ListAreas adds command to list all area destinations.
 */
class ListAreas {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'areas',
			alias: [ 'area' ],
			value: (ctx, p) => this.listAreas(ctx.char)
		});

		this.module.help.addTopic({
			id: 'listAreas',
			category: 'buildAreas',
			cmd: 'list areas',
			alias: [ 'list area' ],
			usage: l10n.l('listAreas.usage', usageText),
			shortDesc: l10n.l('listAreas.shortDesc', shortDesc),
			desc: l10n.l('listAreas.helpText', helpText),
			sortOrder: 50,
		});
	}

	listAreas(char) {
		if (!this.module.charLog.validateNotPuppet(char)) {
			return;
		}
		let owned = [];
		for (let m of char.ownedAreas) {
			owned.push('<tr><td><code>#' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml(m.name) + '</td></tr>');
		}
		if (owned.length) {
			this.module.charLog.logComponent(char, 'listAreas', new Elem(n => n.elem('div', { className: 'listareas charlog--pad' }, [
				n.component(new Txt(l10n.l('listAreas.ownedAreas', "Owned areas"), { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html('<tr><th class="charlog--strong">' +
							escapeHtml(l10n.t('listAreas.area', "Area ID")) +
							'</th><th class="charlog--strong">' +
							escapeHtml(l10n.t('listAreas.id', "Area")) +
							'</th></tr>', { tagName: 'thead' }
						)),
						n.component(new Html(owned.join(''), { tagName: 'tbody' }))
					])
				])
			])));
		} else {
			this.module.charLog.logInfo(char, l10n.l('listAreas.noAreas', "You own no areas yet."));
		}
	}
}

export default ListAreas;
