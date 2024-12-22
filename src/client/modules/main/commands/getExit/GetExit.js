import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';
import * as translateErr from 'utils/translateErr';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'get exit <span class="param">Keyword</span>';
const shortDesc = 'Get info about an exit';
const helpText =
`<p>Get info about a visible exit in the room.</p>
<p>Room owners may also get info on hidden or inactive exits.</p>`;

/**
 * GetExit adds command to get exit attributes.
 */
class GetExit {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'charLog',
			'help',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		const defaultAttr = [
			{
				key: 'id',
				value: (ctx, exit, p) => {
					this.module.charLog.logInfo(ctx.char, l10n.l('getExit.exitHasId', "{name} has ID #{exitId}", { name: exit.name.replace(/([^.])\.$/, "$1"), exitId: exit.id }));
				},
				desc: l10n.l('getExit.idDesc', "ID of the exit."),
				sortOrder: 10,
			},
		];

		this.exitAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('get', {
			key: 'exit',
			next: [
				new ListStep('exitId', this.module.cmdLists.getInRoomExits(), {
					name: "exit",
					textId: 'exitKey',
					errRequired: step => new Err('getExit.keyRequired', "What exit do you want to get info about?"),
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.exitAttr, {
					name: "exit attribute",
					token: 'attr',
					errRequired: null,
				}),
			],
			value: this._exec.bind(this),
		});

		this.module.help.addTopic({
			id: 'getExit',
			category: 'buildRooms',
			cmd: 'get exit',
			usage: l10n.l('getExit.usage', usageText),
			shortDesc: l10n.l('getExit.shortDesc', shortDesc),
			desc: l10n.t('getExit.helpText', helpText),
			sortOrder: 75,
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		this.exitAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	_exec(ctx, p) {
		let f = p.attr;
		return ctx.char.call('getExit', p.exitId
			? { exitId: p.exitId }
			: { exitKey: p.exitKey },
		).then(exit => {
			return f
				? f(ctx, exit, p)
				: this.getExit(ctx.char, exit);
		}).catch(err => {
			throw translateErr.exitNotFound(err, p.exitKey);
		});
	}

	getExit(char, exit) {
		try {
			let rows = [
				[ "Exit", escapeHtml(exit.name), { className: 'charlog--strong' }],
				[ "Exit ID", "<code>#" + escapeHtml(exit.id) + "</code>" ],
				[ "Keywords", exit.keys.map(k => escapeHtml(k)).join(", ") ],
			];

			let elem = new Elem(n => {
				return n.elem('div', { className: 'charlog--pad' }, [
					n.elem('div', { className: 'charlog--code' }, [
						n.elem('table', { className: 'tbl-small tbl-nomargin charlog--font-small' }, rows.map(m => n.elem('tr', [
							n.elem('td', { className: 'charlog--strong' }, [
								n.component(new Txt(m[0])),
							]),
							n.elem('td', [
								n.component(new Html(m[1], { className: m[2]?.className })),
							]),
						]))),
					]),
				]);
			});

			this.module.charLog.logComponent(char, 'getExit', elem);
		} catch (ex) {
			console.error(ex);
		}
	}
}

export default GetExit;
