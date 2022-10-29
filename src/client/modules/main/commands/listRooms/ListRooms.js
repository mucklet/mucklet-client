import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'list rooms';
const shortDesc = 'List all rooms your character owns';
const helpText =
`<p>Get a list of all rooms owned by the character.</p>
<p>Alias: <code>list room</code></p>`;

/**
 * ListRooms adds command to list all room destinations.
 */
class ListRooms {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'rooms',
			alias: [ 'room' ],
			value: (ctx, p) => this.listRooms(ctx.char)
		});

		this.module.help.addTopic({
			id: 'listRooms',
			category: 'buildRooms',
			cmd: 'list rooms',
			alias: [ 'list room' ],
			usage: l10n.l('listRooms.usage', usageText),
			shortDesc: l10n.l('listRooms.shortDesc', shortDesc),
			desc: l10n.l('listRooms.helpText', helpText),
			sortOrder: 50,
		});
	}

	listRooms(char) {
		if (!this.module.charLog.validateNotPuppet(char)) {
			return;
		}
		let owned = [];
		for (let m of char.ownedRooms) {
			owned.push('<tr><td><code>#' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml(m.name) + '</td></tr>');
		}
		if (owned.length) {
			this.module.charLog.logComponent(char, 'listRooms', new Elem(n => n.elem('div', { className: 'listrooms charlog--pad' }, [
				n.component(new Txt(l10n.l('listRooms.ownedRooms', "Owned rooms"), { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html('<tr><th class="charlog--strong">' +
							escapeHtml(l10n.t('listRooms.room', "Room ID")) +
							'</th><th class="charlog--strong">' +
							escapeHtml(l10n.t('listRooms.id', "Room")) +
							'</th></tr>', { tagName: 'thead' }
						)),
						n.component(new Html(owned.join(''), { tagName: 'tbody' }))
					])
				])
			])));
		} else {
			this.module.charLog.logInfo(char, l10n.l('listRooms.noRooms', "You own no rooms yet."));
		}
	}
}

export default ListRooms;
