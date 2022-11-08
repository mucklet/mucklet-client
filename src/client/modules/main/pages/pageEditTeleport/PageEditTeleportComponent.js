import { Elem, Txt, Input } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
import errString from 'utils/errString';

/**
 * PageEditTeleportComponent renders a teleport node edit page.
 */
class PageEditTeleportComponent {
	constructor(module, ctrl, node, isGlobal, state, close) {
		state.model = state.model || {};
		state.node = state.node || {};
		state.nodeInfo = state.nodeInfo || {};

		this.module = module;
		this.ctrl = ctrl;
		this.node = node;
		this.isGlobal = isGlobal;
		this.state = state;
		this.close = close;
		this.nodeInfo = null;
		this.targetRoom = null;
		this._message = new Collapser();
	}

	render(el) {
		let model = new ModifyModel(this.node, { eventBus: this.module.self.app.eventBus });
		this.elem = new Elem(n => n.elem('div', { className: 'pageeditteleport' }, [
			n.component(new PanelSection(
				l10n.l('pageEditTeleport.destination', "Destination"),
				new ModelTxt(this.node.room, m => m.name),
				{
					className: 'common--sectionpadding',
					noToggle: true,
				},
			)),
			n.component(new PanelSection(
				l10n.l('pageEditTeleport.keyword', "Keyword"),
				new Input(model.key, {
					events: { input: c => model.set({ key: c.getValue() }) },
					attributes: { spellcheck: 'false' },
				}),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('pageEditTeleport.keyInfo', "A keyword used for identifying the teleport destination."),
				},
			)),
			n.component(this._message),
			n.elem('div', { className: 'pad-top-xl flex-row margin8 flex-end' }, [
				n.elem('div', { className: 'flex-1' }, [
					n.component(new ModelComponent(
						model,
						new Elem(n => n.elem('update', 'button', { events: {
							click: () => this._save(model),
						}, className: 'btn primary' }, [
							n.component(new Txt(l10n.l('pageEditTeleport.update', "Save edits"))),
						])),
						(m, c) => c.setProperty('disabled', m.isModified ? null : 'disabled'),
					)),
				]),
				n.elem('button', { events: {
					click: () => this._delete(),
				}, className: 'iconbtn medium' }, [
					n.component(new FAIcon('trash')),
				]),
			]),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_save(model) {
		let params = Object.assign({ nodeId: model.id }, model.getModifications());

		return this.ctrl.call('setTeleport', params).then(() => {
			this._close();
		}).catch(err => {
			this._setMessage(errString(err));
		});
	}

	_setMessage(msg) {
		this._message.setComponent(msg
			? new Txt(msg, { className: 'dialog--error' })
			: null,
		);
	}

	_delete() {
		let p = { nodeId: this.node.id };
		if (this.isGlobal) {
			let mod = this.module.self.app.getModule('deleteTeleport');
			if (!mod) {
				this._setMessage(l10n.l('pageEditTeleport.missingDeleteTeleportModule', "Can't find the deleteTeleport module."));
			} else {
				mod.deleteTeleport(this.ctrl, p);
			}
			return;
		}

		this.module.confirm.open(() => this.module.unregisterTeleport.unregisterTeleport(this.ctrl, p)
			.catch(err => this._setMessage(errString(err))),
		{
			title: l10n.l('pageEditTeleport.confirmRemove', "Confirm remove"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('pageEditTeleport.removeNodeBody', "Do you really wish to remove the teleport node?"), { tagName: 'p' })),
				n.elem('p', [ n.component(new ModelTxt(this.node.room, m => m.name, { className: 'dialog--strong' })) ]),
			])),
			confirm: l10n.l('pageEditTeleport.remove', "Remove"),
		});
	}

	_close() {
		this.close();
	}
}

export default PageEditTeleportComponent;
