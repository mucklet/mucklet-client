import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';

const usageText = 'delete room';
const shortDesc = 'Delete current room';
const helpText =
`<p>Delete current room and all exits leading there.</p>`;

/**
 * DeleteRoom adds command to delete current room.
 */
class DeleteRoom {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'confirm', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('delete', {
			key: 'room',
			value: (ctx, p) => this.deleteRoom(ctx.char),
		});

		this.module.help.addTopic({
			id: 'deleteRoom',
			category: 'buildRooms',
			cmd: 'delete room',
			usage: l10n.l('deleteRoom.usage', usageText),
			shortDesc: l10n.l('deleteRoom.shortDesc', shortDesc),
			desc: l10n.l('deleteRoom.helpText', helpText),
			sortOrder: 40,
		});
	}

	deleteRoom(char) {
		let room = char.inRoom;
		this.module.confirm.open(() => char.call('deleteRoom', { roomId: room.id }).then(() => {
			this.module.charLog.logInfo(char, l10n.l('deleteRoom.deletedRoom', "Room was successfully deleted."));
		}), {
			title: l10n.l('deleteRoom.confirmDelete', "Confirm deletion"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('deleteRoom.deleteRoomBody', "Do you really wish to delete the current room?"), { tagName: 'p' })),
				n.elem('p', [ n.component(new ModelTxt(room, m => m.name, { className: 'dialog--strong' })) ]),
				n.elem('p', { className: 'dialog--error' }, [
					n.component(new FAIcon('exclamation-triangle')),
					n.html("&nbsp;&nbsp;"),
					n.component(new Txt(l10n.l('deleteRoom.deletionWarning', "Deletion cannot be undone."))),
				]),
			])),
			confirm: l10n.l('deleteRoom.delete', "Delete"),
		});
	}
}

export default DeleteRoom;
