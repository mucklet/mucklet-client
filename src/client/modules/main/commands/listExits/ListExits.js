import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';
import charLogTable from 'utils/charLogTable';
import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';
import './listExits.scss';

const usageText = 'list exits';
const shortDesc = 'List all room exits';
const helpText =
`<p>Get a list of available room exits.</p>
<p>Alias: <code>list exit</code></p>`;

const allUsageText = 'list exits all';
const allShortDesc = 'List details about all room exits';
const allHelpText =
`<p>Get a detailed list of all room exits. Room owners will also list hidden exits, deactivate exits, and external exits targeting current room.</p>
<p>Alias: <code>list exit all</code></p>`;

const txtRoomExits = l10n.l('listExits.roomExits', "Room exits");
const txtHiddenExits = l10n.l('listExits.hiddenExits', "Hidden exits");
const txtExitsTargetingRoom = l10n.l('listExits.exitsLeadingToRoom', "Exits targeting room");

/**
 * ListExits adds command to list all exit destinations.
 */
class ListExits {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'help',
			'player',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'exits',
			alias: [ 'exit' ],
			next: [
				new ListStep('all', new ItemList({
					items: [{ key: 'all' }],
				}), {
					name: "focus at",
					token: 'name',
					errNotFound: step => new Err('focus.allNotFound', "Did you mean to list all?"),
					errRequired: null,
				}),
			],
			value: (ctx, p) => p.all ? this.listAllExits(ctx.char) : this.listExits(ctx.char),
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

		this.module.help.addTopic({
			id: 'listExitsAll',
			category: 'buildRooms',
			cmd: 'list exits all',
			alias: [ 'list exit all' ],
			usage: l10n.l('listExits.allUsage', allUsageText),
			shortDesc: l10n.l('listExits.allShortDesc', allShortDesc),
			desc: l10n.l('listExits.allHelpText', allHelpText),
			sortOrder: 77,
		});
	}

	listExits(ctrl) {
		let list = [];
		for (let m of ctrl.inRoom.exits) {
			list.push('<tr><td><code>go ' + escapeHtml(m.keys[0]) + '</code></td><td>' + escapeHtml(m.name) + '</td></tr>');
		}
		if (list.length) {
			this.module.charLog.logComponent(ctrl, 'listExits', new Elem(n => n.elem('div', { className: 'listexits charlog--pad' }, [
				n.component(new Txt(l10n.t(txtRoomExits), { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html(list.join(''), { tagName: 'tbody' })),
					]),
				]),
			])));
		} else {
			this.module.charLog.logInfo(ctrl, l10n.l('listExits.noExits', "This room has no exits."));
		}
	}

	async listAllExits(ctrl) {
		let canEdit = this._canEdit(ctrl, ctrl.inRoom);
		// Store away current room in case we change room while fetching exit info.
		let roomId = ctrl.inRoom.id;
		let roomExits = ctrl.inRoom.exits.toArray();
		let hiddenExits = canEdit
			? await this.module.api.get(`core.room.${ctrl.inRoom.id}.exits.hidden`)
			: null;
		let remoteExits = canEdit
			? await ctrl.call('getTargetingExits').then(result => {
				let { exits, rooms } = result;
				return exits.filter(e => e.roomId != roomId).map(e => {
					let room = rooms.find(r => r.id == e.roomId);
					return { ...e, room };
				});
			})
			: null;

		let hasOutput = false;

		if (roomExits.length) {
			this._listExits(ctrl, txtRoomExits, roomExits);
			hasOutput = true;
		}

		if (hiddenExits) {
			let exits = Object.keys(hiddenExits.props)
				.map(id => hiddenExits.props[id])
				.sort((a, b) => a.keys[0].localeCompare(b.keys[0]) || a.name.localeCompare(b.name));
			if (exits.length) {
				this._listExits(ctrl, txtHiddenExits, exits, true);
				hasOutput = true;
			}
		}

		if (remoteExits?.length) {
			this._listExits(ctrl, txtExitsTargetingRoom, remoteExits, false, true);
			hasOutput = true;
		}

		if (!hasOutput) {
			this.module.charLog.logInfo(ctrl, canEdit
				? l10n.l('listExits.noAvailableExits', "This room has no exits at all.")
				: l10n.l('listExits.noVisibleExits', "This room has no visible exits."),
			);
		}
	}

	_listExits(ctrl, title, exits, showActive, sourceRoom) {
		let rows = [];
		for (let m of exits) {
			rows.push([
				{ html: `<code>#${escapeHtml(m.id)}</code>` },
				{ text: m.keys[0] },
				{ text: m.name },
				...(sourceRoom ? [{ text: m.room?.name || '' }] : []),
				...(showActive ? [{ html: `<i class="fa fa-circle listexits-${m.inactive ? 'inactive' : 'active'}" aria-hidden></i>` }] : []),
			]);
		}
		if (rows.length) {
			this.module.charLog.logComponent(ctrl, 'listExits', new Elem(n => n.elem('div', { className: 'listexits charlog--pad' }, [
				n.component(new Txt(l10n.t(title), { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.html(charLogTable(
						[
							{ text: l10n.t('listExits.exitId', "Exit ID"), thClassName: 'charlog--strong' },
							{ text: l10n.t('listExits.key', "Key"), thClassName: 'charlog--strong' },
							{ text: l10n.t('listExits.updated', "Name"), thClassName: 'charlog--strong' },
							...(sourceRoom ? [{ text: l10n.t('listExits.origin', "Origin"), thClassName: 'charlog--strong' }] : []),
							...(showActive ? [{ text: l10n.t('listExits.active', "Active"), thClassName: 'charlog--strong' }] : []),
						],
						rows,
						{ className: 'tbl-nomargin' },
					)),
				]),
			])));
		}
	}

	/**
	 * Checks if a controlled character can edit a room.
	 * @param {Model} ctrl Controlled character model.
	 * @param {Model} room Room model.
	 * @returns {boolean} True if allowed to edit room, otherwise false.
	 */
	_canEdit(ctrl, room) {
		return !ctrl.puppeteer && (this.module.player.isBuilder() || (room.owner && room.owner.id == ctrl.id));
	}

}

export default ListExits;
