import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'list exits';
const shortDesc = 'List all room exits';
const helpText =
`<p>Get a list of room exits.</p>
<p>Alias: <code>list exit</code></p>`;

/**
 * ListExits adds command to list all exit destinations.
 */
class ListExits {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'exits',
			alias: [ 'exit' ],
			value: (ctx, p) => this.listExits(ctx.char),
		});

		this.module.help.addTopic({
			id: 'listExits',
			category: 'transport',
			cmd: 'list exits',
			alias: [ 'list exit' ],
			usage: l10n.l('listExits.usage', usageText),
			shortDesc: l10n.l('listExits.shortDesc', shortDesc),
			desc: l10n.l('listExits.helpText', helpText),
			sortOrder: 15,
		});
	}

	listExits(char, attr) {
		let list = [];
		for (let m of char.inRoom.exits) {
			list.push('<tr><td><code>go ' + escapeHtml(m.keys[0]) + '</code></td><td>' + escapeHtml(m.name) + '</td></tr>');
		}
		if (list.length) {
			this.module.charLog.logComponent(char, 'listExits', new Elem(n => n.elem('div', { className: 'listexits charlog--pad' }, [
				n.component(new Txt(l10n.l('listExits.roomExits', "Room exits"), { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html(list.join(''), { tagName: 'tbody' })),
					]),
				]),
			])));
		} else {
			this.module.charLog.logInfo(char, l10n.l('listExits.noExits', "This room has no exits."));
		}
	}
}

export default ListExits;
