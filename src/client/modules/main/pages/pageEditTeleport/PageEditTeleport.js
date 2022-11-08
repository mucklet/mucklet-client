import PageEditTeleportComponent from './PageEditTeleportComponent';
import l10n from 'modapp-l10n';
import './pageEditTeleport.scss';

/**
 * PageEditTeleport opens an in-panel edit teleport node page in the char panel.
 */
class PageEditTeleport {
	constructor(app, params) {
		this.app = app;
		this.app.require([ 'api', 'charPages', 'confirm', 'unregisterTeleport' ], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
		this.nodePages = {};
	}


	/**
	 * Opens an in-panel edit node page in the char panel.
	 * @param {*} ctrl Controlled char model.
	 * @param {*} node Node model of the node to edit.
	 * @param {*} isGlobal Flag telling if the node is a global node.
	 * @returns {function} Close function.
	 */
	open(ctrl, node, isGlobal) {
		if (this.nodePages[node.id]) {
			throw new Error("Edit teleport page already open");
		}

		let close = this.module.charPages.openPage(
			ctrl.id,
			ctrl.id,
			(ctrl, char, state, close) => ({
				component: new PageEditTeleportComponent(this.module, ctrl, node, isGlobal, state, close),
				title: l10n.l('pageEditTeleport.editTeleportNode', "Edit teleport node"),
				onClose: close,
			}),
			() => this._onClose(node),
		);

		// Close the page if the node gets deleted
		let d = { close, onDelete: () => this._onDelete(node) };
		this.nodePages[node.id] = d;
		node.on('delete', d.onDelete);

		return close;
	}

	_onClose(node) {
		let d = this.nodePages[node.id];
		if (d) {
			node.off('delete', d.onDelete);
			delete this.nodePages[node.id];
		}
	}

	_onDelete(node) {
		let d = this.nodePages[node.id];
		if (d) {
			d.close();
		}
	}
}

export default PageEditTeleport;
