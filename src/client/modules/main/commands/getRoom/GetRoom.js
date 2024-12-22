import { Elem, Txt, Html } from 'modapp-base-component';

import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';
import escapeHtml from 'utils/escapeHtml';
import MultiDelimStep from 'classes/MultiDelimStep';
import NumberStep from 'classes/NumberStep';
import Err from 'classes/Err';

const itemsPerPage = 50;

const usageText = 'get room <span class="param">Attribute</span> <span class="opt">page <span class="param">Page</span></span>';
const shortDesc = 'Get info about current room';
const helpText =
`<p>Get the value of a room attribute.</p>
<p><code class="param">Page</code> is the optional page for lists. Starts at 1.</p>`;
const examples = [
	{ cmd: 'get room id', desc: l10n.l('getRoom.getRoomIdDesc', "Shows current room's ID") },
	{ cmd: 'get room owner', desc: l10n.l('getRoom.getRoomOwnerDesc', "Shows current room's owner") },
	{ cmd: 'get room teleporters', desc: l10n.l('getRoom.getRoomTeleportersDesc', "Lists the first {limit} characters with room registered as a teleport node", { limit: itemsPerPage }) },
	{ cmd: 'get room tenants page 2', desc: l10n.l('getRoom.getRoomTenantsDesc', "Lists characters {from} - {to} with current room set as home", { from: (itemsPerPage * 2 + 1), to: (itemsPerPage * 3) }) },
];

/**
 * GetRoom adds command to get room attributes values.
 */
class GetRoom {
	constructor(app) {
		this.app = app;

		this.app.require([
			'api',
			'cmd',
			'cmdLists',
			'charLog',
			'help',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		const defaultAttr = [
			{
				key: 'id',
				value: (char, room, ctx, p) => {
					this.module.charLog.logInfo(char, l10n.l('getRoom.roomHasId', "{name} has ID #{roomId}", { name: room.name.replace(/([^.])\.$/, "$1"), roomId: room.id }));
				},
				desc: l10n.l('getRoom.idDesc', "ID of the room."),
				sortOrder: 10,
			},
			{
				key: 'owner',
				value: (char, room, ctx, p) => {
					let owner = room.owner;
					this.module.charLog.logInfo(char, l10n.l('getRoom.roomHasOwner', "{name} has owner {owner}", { name: room.name.replace(/([^.])\.$/, "$1"), owner: (owner.name + " " + owner.surname).trim() }));
				},
				desc: l10n.l('getRoom.ownerDesc', "Owner of the room."),
				sortOrder: 20,
			},
			{
				key: 'tenants',
				next: [
					new MultiDelimStep([
						{
							delim: /page\b/,
							step: {
								next: new NumberStep('page', {
									name: "page step",
								}),
								errRequired: null,
							},
						},
					], { token: 'attr' }),
				],
				value: (char, room, ctx, p) => {
					let page = typeof p.page == 'number' ? p.page : 1;
					if (page < 1) {
						return Promise.reject(new Err('getRoom.pageNumberBetween', "Page number must be 1 or greater."));
					}
					this.module.api.get(`core.room.${room.id}.tenants?offset=${(page - 1) * itemsPerPage}&limit=${itemsPerPage + 1}`).then(tenants => {
						let list = [];
						for (let m of tenants) {
							if (list.length == itemsPerPage) {
								list.push('<tr><td rowspan="2">' + escapeHtml(l10n.t('getRoom.andMore', "... and more")) + '</td></tr>');
							} else {
								list.push('<tr><td><code>#' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml((m.name + ' ' + m.surname).trim()) + '</td></tr>');
							}
						}
						if (list.length) {
							this.module.charLog.logComponent(char, 'getRoomTenants', new Elem(n => n.elem('div', { className: 'getroom-tenants charlog--pad' }, [
								n.component(new Txt(
									page == 1
										? l10n.l('getRoomTenants.roomTenants', "Room tenants")
										: l10n.l('getRoomTenants.roomTenants', "Room tenants - page {page}", { page }),
									{ tagName: 'h4', className: 'charlog--pad' },
								)),
								n.elem('div', { className: 'charlog--code' }, [
									n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
										n.component(new Html('<tr><th class="charlog--strong">' +
											escapeHtml(l10n.t('getRoomTenants.area', "Character ID")) +
											'</th><th class="charlog--strong">' +
											escapeHtml(l10n.t('getRoomTenants.id', "Name")) +
											'</th></tr>', { tagName: 'thead' },
										)),
										n.component(new Html(list.join(''), { tagName: 'tbody' })),
									]),
								]),
							])));
						} else {
							this.module.charLog.logInfo(char, page == 1
								? this.module.charLog.logInfo(char, l10n.l('getRoomTenants.noTenants', "The room has no tenants."))
								: this.module.charLog.logInfo(char, l10n.l('getRoomTenants.noTenants', "This page has no room tenants.")),
							);
						}
					});
				},
				desc: l10n.l('getRoom.tenantsDesc', "List characters with room set as home. {limit} per page.", { limit: itemsPerPage }),
				sortOrder: 30,
			},
			{
				key: 'teleporters',
				next: [
					new MultiDelimStep([
						{
							delim: /page\b/,
							step: {
								next: new NumberStep('page', { name: "page step" }),
								errRequired: null,
							},
						},
					], { token: 'attr' }),
				],
				value: (char, room, ctx, p) => {
					let page = typeof p.page == 'number' ? p.page : 1;
					if (page < 1) {
						return Promise.reject(new Err('getRoom.pageNumberBetween', "Page number must be 1 or greater."));
					}
					this.module.api.get(`core.room.${room.id}.nodes?offset=${(page - 1) * itemsPerPage}&limit=${itemsPerPage + 1}`).then(teleporters => {
						let list = [];
						for (let m of teleporters) {
							if (list.length == itemsPerPage) {
								list.push('<tr><td rowspan="2">' + escapeHtml(l10n.t('getRoom.andMore', "... and more")) + '</td></tr>');
							} else {
								list.push('<tr><td><code>#' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml((m.name + ' ' + m.surname).trim()) + '</td></tr>');
							}
						}
						if (list.length) {
							this.module.charLog.logComponent(char, 'getRoomNodes', new Elem(n => n.elem('div', { className: 'getroom-teleporters charlog--pad' }, [
								n.component(new Txt(
									page == 1
										? l10n.l('getRoom.teleportNodeCharacters', "Teleport node characters")
										: l10n.l('getRoom.teleportNodeCharacters', "Teleport node characters - page {page}", { page }),
									{ tagName: 'h4', className: 'charlog--pad' },
								)),
								n.elem('div', { className: 'charlog--code' }, [
									n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
										n.component(new Html('<tr><th class="charlog--strong">' +
											escapeHtml(l10n.t('getRoomTenants.area', "Character ID")) +
											'</th><th class="charlog--strong">' +
											escapeHtml(l10n.t('getRoomTenants.id', "Name")) +
											'</th></tr>', { tagName: 'thead' },
										)),
										n.component(new Html(list.join(''), { tagName: 'tbody' })),
									]),
								]),
							])));
						} else {
							this.module.charLog.logInfo(char, page == 1
								? this.module.charLog.logInfo(char, l10n.l('getRoomTenants.noTenants', "The room has no registered teleport node characters."))
								: this.module.charLog.logInfo(char, l10n.l('getRoomTenants.noPageTenants', "This page has no registered teleport node characters.")),
							);
						}
					});
				},
				desc: l10n.l('getRoom.teleportersDesc', "List characters with room registered as a teleport node. {limit} per page.", { limit: itemsPerPage }),
				sortOrder: 40,
			},
		];

		this.roomAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('get', {
			key: 'room',
			next: new ListStep('attr', this.roomAttr, {
				name: "room attribute",
				token: 'attr',
			}),
			value: this._exec.bind(this),
		});

		this.module.help.addTopic({
			id: 'getRoom',
			category: 'buildRooms',
			cmd: 'get room',
			usage: l10n.l('getRoom.usage', usageText),
			shortDesc: l10n.l('getRoom.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('getRoom.helpText', helpText), this.roomAttr.getItems(), {
				value: '',
			}),
			examples,
			sortOrder: 30,
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		this.roomAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	_exec(ctx, p) {
		let char = ctx.char;
		let room = char.inRoom;

		let f = p.attr;
		return f(char, room, ctx, p);
	}
}

export default GetRoom;
