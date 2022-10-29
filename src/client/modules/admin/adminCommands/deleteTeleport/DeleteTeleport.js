import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import ListStep from 'classes/ListStep';

const usageText = 'delete teleport <span class="param">Keyword</span>';
const shortDesc = 'Delete a global teleport destination';
const helpText =
`<p>Delete a global teleport destination.</p>
<p><code class="param">Keyword</code> is the keyword of the teleport destination to delete.</p>`;


/**
 * DeleteTeleport adds command to delete a global teleport destination.
 */
class DeleteTeleport {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'globalTeleports', 'confirm', 'charLog', 'helpAdmin' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addPrefixCmd('delete', {
			key: 'teleport',
			next: new ListStep('nodeId', this.module.globalTeleports.getGlobalTeleportsList(), {
				name: "global teleport destination keyword"
			}),
			value: (ctx, p) => this.deleteTeleport(ctx.char, { nodeId: p.nodeId })
		});

		this.module.helpAdmin.addTopic({
			id: 'deleteTeleport',
			cmd: 'delete teleport',
			usage: l10n.l('deleteTeleport.usage', usageText),
			shortDesc: l10n.l('deleteTeleport.shortDesc', shortDesc),
			desc: l10n.l('deleteTeleport.helpText', helpText),
			sortOrder: 120,
		});
	}

	deleteTeleport(char, params) {
		let node = this.module.globalTeleports.getNode(params.nodeId);
		this.module.confirm.open(() => char.call('deleteTeleport', params).then(result => {
			this.module.charLog.logInfo(char, l10n.l('deleteTeleport.teleportNodeDeleted', "Deleted global teleport destination to {roomName}.", { roomName: node.room.name }));
		}), {
			title: l10n.l('deleteTeleport.confirmDelete', "Confirm deletion"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('deleteTeleport.deleteTeleportBody', "Do you really wish to delete the global teleport destination?"), { tagName: 'p' })),
				n.elem('p', [ n.component(new ModelTxt(node.room, m => m.name, { className: 'dialog--strong' })) ]),
				n.elem('p', { className: 'dialog--error' }, [
					n.component(new FAIcon('exclamation-triangle')),
					n.html("&nbsp;&nbsp;"),
					n.component(new Txt(l10n.l('deleteTeleport.deletionWarning', "Deletion will remove the teleport destination for everyone."))),
				]),
			])),
			confirm: l10n.l('deleteTeleport.delete', "Delete")
		});
	}
}

export default DeleteTeleport;
