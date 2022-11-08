import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';

const usageText = 'delete exit <span class="param">Keyword</span>';
const shortDesc = 'Delete an exit';
const helpText =
`<p>Delete an exit.</p>
<p><code class="param">Keyword</code> is the keyword of the exit to delete.</p>`;

/**
 * DeleteExit adds command to delete an existing room exit.
 */
class DeleteExit {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('delete', {
			key: 'exit',
			next: new ListStep('exitId', this.module.cmdLists.getInRoomExits(), {
				name: "exit",
			}),
			value: (ctx, p) => this.deleteExit(ctx.char, { exitId: p.exitId }),
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

	deleteExit(char, params) {
		return char.call('deleteExit', params).then(() => {
			this.module.charLog.logInfo(char, l10n.l('deleteExit.deletedExit', "Exit was successfully deleted."));
		});
	}
}

export default DeleteExit;
