import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import Err from 'classes/Err';
import * as translateErr from 'utils/translateErr';

const usageText = 'delete exit <span class="param">Keyword<span class="comment">/</span>#Exit ID</span>';
const shortDesc = 'Delete an exit';
const helpText =
`<p>Delete an exit in the room, or another room's exit targeting the current room.</p>
<p>Use <code>list exits all</code> to get a detailed list of all exits that can be deleted.</p>
<p><code class="param">Keyword</code> is the keyword of the exit to delete.</p>
<p><code class="param">#Exit ID</code> is the ID of the exit to delete.</p>`;

/**
 * DeleteExit adds command to delete an existing room exit.
 */
class DeleteExit {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'charLog',
			'help',
			'confirm',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('delete', {
			key: 'exit',
			next: new IDStep('exitId', {
				name: "exit key or ID",
				else: new ListStep('exitId', this.module.cmdLists.getInRoomExits(), {
					name: "exit",
					textId: 'exitKey',
					errRequired: step => new Err('deleteExit.keyRequired', "What exit do you want to delete?"),
				}),
			}),
			value: (ctx, p) => this._deleteExit(ctx.char, p.exitId
				? { exitId: p.exitId }
				: { exitKey: p.exitKey },
			),
		});

		this.module.help.addTopic({
			id: 'deleteExit',
			category: 'buildRooms',
			cmd: 'delete exit',
			usage: l10n.l('deleteExit.usage', usageText),
			shortDesc: l10n.l('deleteExit.shortDesc', shortDesc),
			desc: l10n.l('deleteExit.helpText', helpText),
			sortOrder: 80,
		});
	}

	_deleteExit(char, params) {
		return char.call('getExit', params).then(exit => {
			this.module.confirm.open(() => this.deleteExit(char, params), {
				title: l10n.l('deleteExit.confirmDelete', "Confirm deletion"),
				body: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('deleteExit.deleteExitBody', "Do you really wish to delete the exit?"), { tagName: 'p' })),
					n.elem('p', [
						n.component(new ModelTxt(exit, m => m.name, { tagName: 'div', className: 'dialog--strong' })),
						n.component(new ModelTxt(exit.room, m => m.name, { tagName: 'div', className: 'dialog--small' })),
					]),
					n.elem('p', { className: 'dialog--error' }, [
						n.component(new FAIcon('exclamation-triangle')),
						n.html("&nbsp;&nbsp;"),
						n.component(new Txt(l10n.l('deleteExit.deletionWarning', "Deletion cannot be undone."))),
					]),
				])),
				confirm: l10n.l('deleteExit.delete', "Delete"),
			});
		}).catch(err => {
			throw translateErr.exitNotFound(err, params.exitKey);
		});
	}

	deleteExit(char, params) {
		return char.call('deleteExit', params).then(() => {
			this.module.charLog.logInfo(char, l10n.l('deleteExit.deletedExit', "Exit was successfully deleted."));
		}).catch(err => {
			throw translateErr.exitNotFound(err, params.exitKey);
		});
	}
}

export default DeleteExit;
