import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'list teleports';
const shortDesc = 'List available teleport destinations';
const helpText =
`<p>Get a list of available teleport destinations.</p>
<p>Alias: <code>list t</code>, <code>list tp</code>, <code>list teleport</code></p>`;

/**
 * ListTeleports adds command to list all teleport destinations.
 */
class ListTeleports {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help', 'globalTeleports' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'teleports',
			alias: [ 't', 'tp', 'teleport' ],
			value: (ctx, p) => this.listTeleports(ctx.char),
		});

		this.module.help.addTopic({
			id: 'listTeleports',
			category: 'transport',
			cmd: 'list teleports',
			alias: [ 'list t', 'list tp', 'list teleport' ],
			usage: l10n.l('listTeleports.usage', usageText),
			shortDesc: l10n.l('listTeleports.shortDesc', shortDesc),
			desc: l10n.l('listTeleports.helpText', helpText),
			sortOrder: 210,
		});
	}

	listTeleports(char) {
		let list = [];
		let owned = [];
		for (let m of (this.module.globalTeleports.getGlobalTeleports() || [])) {
			list.push('<tr><td><code>t ' + escapeHtml(m.key) + '</code></td><td class="charlog--strong">' + escapeHtml(m.room.name) + '.</td></tr>');
		}
		for (let m of char.nodes) {
			list.push('<tr><td><code>t ' + escapeHtml(m.key) + '</code></td><td>' + escapeHtml(m.room.name) + '</td></tr>');
		}
		if (!char.puppeteer) {
			for (let m of char.ownedRooms) {
				owned.push('<tr><td><code>t #' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml(m.name) + '</td></tr>');
			}
		}
		if (list.length || owned.length) {
			this.module.charLog.logComponent(char, 'listTeleports', new Elem(n => {
				let children = [];
				if (list.length) {
					children.push(n.component(new Txt(l10n.l('listTeleports.teleportDestinations', "Teleport destinations"), { tagName: 'h4', className: 'charlog--pad' })));
					children.push(n.elem('div', { className: 'charlog--code' }, [
						n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
							n.component(new Html(list.join(''), { tagName: 'tbody' })),
						]),
					]));
				};
				if (owned.length) {
					children.push(n.component(new Txt(l10n.l('listTeleports.ownedRooms', "Owned rooms"), { tagName: 'h4', className: 'charlog--pad' })));
					children.push(n.elem('div', { className: 'charlog--code' }, [
						n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
							n.component(new Html(owned.join(''), { tagName: 'tbody' })),
						]),
					]));
				}
				return n.elem('div', { className: 'listteleports charlog--pad' }, children);
			}));
		} else {
			this.module.charLog.logInfo(char, l10n.l('listTeleports.noTeleports', "There are no teleport destinations."));
		}
	}
}

export default ListTeleports;
