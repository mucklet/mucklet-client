import { Elem, Txt, Input } from 'modapp-base-component';
import { ModelComponent, CollectionComponent, ModelTxt, CollectionList } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import PanelSection from 'components/PanelSection';
import ModelCollapser from 'components/ModelCollapser';
import LabelToggleBox from 'components/LabelToggleBox';
import SimpleBar from 'components/SimpleBar';
import errToL10n from 'utils/errToL10n';
import copyToClipboard from 'utils/copyToClipboard';
import formatByteSize from 'utils/formatByteSize';
import formatDateTime from 'utils/formatDateTime';

const logLvlClass = {
	log: 'pageeditroomscript--log-log',
	debug: 'pageeditroomscript--log-debug',
	info: 'pageeditroomscript--log-info',
	warn: 'pageeditroomscript--log-warn',
	error: 'pageeditroomscript--log-error',
};


class PageEditRoomScriptComponent {
	constructor(module, ctrl, room, script, roomScripts, state, close) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.script = script;
		this.roomScripts = roomScripts;
		this.state = state;
		this.close = close;

		this.message = new Collapser(null);
	}

	render(el) {
		this.model = new ModifyModel(this.script, {
			props: this.state.changes,
			eventBus: this.module.self.app.eventBus,
		});
		this.elem = new CollectionComponent(
			this.roomScripts,
			new Elem(n => n.elem('div', { className: 'pageeditroomscript' }, [
				n.component(new ModelTxt(this.room, m => m.name, { tagName: 'div', className: 'common--itemtitle common--sectionpadding' })),

				// Keyword
				n.component(new PanelSection(
					l10n.l('pageEditRoomScript.keyword', "Keyword"),
					new ModelComponent(
						this.model,
						new Input(this.model.key, {
							events: { input: c => this.model.set({ key: c.getValue() }) },
							attributes: { name: 'editroomscript-key', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.key),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditRoomScript.keyInfo', "Keyword is used to identify the room script in console commands."),
					},
				)),

				// Script ID and post address
				n.component(new PanelSection(
					l10n.l('pageEditRoomScript.scriptId', "Script ID"),
					new Elem(n => n.elem('div', [
						n.component(new ModelTxt(this.script, m => "#" + m.id, { className: 'pageeditroomscript--scriptid pad-bottom-l' })),
						n.elem('btn', 'div', { className: 'badge' }, [
							n.elem('div', { className: 'badge--select' }, [
								n.elem('div', { className: 'badge--info' }, [
									n.component(new Txt(l10n.l('pageEditRoomScript.keyword', "Post address"), { tagName: 'div', className: 'badge--title' })),
									n.component(new ModelTxt(this.script, m => m.address, { tagName: 'div', className: 'pageeditroomscript--postaddress badge--text badge--nowrap' })),
								]),
								n.elem('div', { className: 'badge--tools' }, [
									n.elem('button', { className: 'iconbtn medium tinyicon', events: {
										click: (c, ev) => {
											this._copyAddressToClipboard();
											ev.stopPropagation();
										},
									}}, [
										n.component(new FAIcon('clipboard')),
									]),
								]),
							]),
						]),
					])),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditRoomScript.postAddressInfo', "Post address is used by other scripts to send post messages to this script."),
					},
				)),

				// Binary file
				n.component(new ModelCollapser(this.script, [{
					condition: m => m.binary,
					factory: m => new PanelSection(
						l10n.l('pageEditRoomScript.binaryFile', "Binary file"),
						new ModelComponent(
							m,
							new ModelComponent(
								m.binary,
								new Elem(n => n.elem('btn', 'div', { className: 'badge' }, [
									n.elem('div', { className: 'badge--select' }, [
										n.elem('div', { className: 'badge--info' }, [
											n.elem('div', { className: 'flex-row' }, [
												n.component(new Txt(l10n.l('pageEditRoomScript.file', "File"), { className: 'badge--iconcol badge--subtitle badge--nowrap' })),
												n.component('filename', new Txt('', { className: 'badge--strong' })),
											]),
											n.elem('div', { className: 'flex-row' }, [
												n.component(new Txt(l10n.l('pageEditRoomScript.size', "Size"), { className: 'badge--iconcol badge--subtitle' })),
												n.component('size', new Txt('', { className: 'badge--text' })),
											]),
										]),
										n.elem('div', { className: 'badge--tools' }, [
											n.elem('link', 'a', {
												className: 'iconbtn medium tinyicon',
												attributes: { download: true },
											}, [
												n.component(new FAIcon('download')),
											]),
										]),
									]),
								])),
								(m, c) => {
									c.setNodeAttribute('link', 'href', m.href);
									c.getNode('filename').setText(m.filename);
									c.getNode('size').setText(formatByteSize(m.size));
								},
							),
							(m, c) => c.setModel(m.binary),
						),
						{
							className: 'common--sectionpadding',
							noToggle: true,
							popupTip: l10n.l('pageEditRoomScript.binaryFileInfo', "Binary wasm script file. It may be downloaded, but the original script used to compile the file is not available."),
						},
					),
				}])),

				// Source code
				n.component(new ModelCollapser(this.script, [{
					condition: m => m.source,
					factory: m => new PanelSection(
						l10n.l('pageEditRoomScript.sourceCode', "Source code"),
						new ModelComponent(
							m,
							new ModelComponent(
								m.source,
								new Elem(n => n.elem('btn', 'div', { className: 'badge' }, [
									n.elem('div', { className: 'badge--select' }, [
										n.elem('div', { className: 'badge--info-nopad' }, [
											n.elem('div', { className: 'flex-row' }, [
												n.component(new Txt(l10n.l('pageEditRoomScript.time', "Time"), { className: 'badge--iconcol badge--subtitle badge--nowrap' })),
												n.component('time', new Txt('', { className: 'badge--info badge--strong' })),
											]),
											n.elem('div', { className: 'flex-row' }, [
												n.component(new Txt(l10n.l('pageEditRoomScript.size', "Size"), { className: 'badge--iconcol badge--subtitle' })),
												n.component('size', new Txt('', { className: 'badge--info badge--text' })),
											]),
										]),
										n.elem('div', { className: 'badge--tools' }, [
											n.elem('link', 'button', {
												className: 'iconbtn medium tinyicon',
												events: {
													click: (c, ev) => {
														this.module.dialogEditScriptSource.open(this.ctrl, this.script.id);
														ev.stopPropagation();
													},
												},
											}, [
												n.component(new FAIcon('pencil')),
											]),
										]),
									]),
								])),
								(m, c) => {
									c.setNodeAttribute('link', 'href', m.href);
									c.getNode('size').setText(formatByteSize(m.size));
								},
							),
							(m, c) => {
								c.getComponent().getNode('time').setText(formatDateTime(new Date(m.updated)));
								c.setModel(m.source);
							},
						),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					),
				}])),

				// Logs
				n.component(new PanelSection(
					l10n.l('pageEditRoomScript.logs', "Logs"),
					new Elem(n => n.elem('div', { className: 'pageeditroomscript--logscont' }, [
						n.component(new SimpleBar(
							new CollectionList(
								this.script.logs,
								log => new Elem(n => n.elem('div', { className: 'pageeditroomscript--log' }, [
									n.component(new Txt(
										formatDateTime(new Date(log.time), { showMilliseconds: true }),
										{ className: 'pageeditroomscript--logtime' },
									)),
									n.component(new Txt(
										log.msg,
										{ className: 'pageeditroomscript--logmsg ' + (logLvlClass[log.lvl] || '') },
									)),
								])),
								{
									className: 'pageeditroomscript--loglist',
								},
							),
							{
								className: 'pageeditroomscript--logs',
								autoHide: false,
							},
						)),
					])),
					{
						className: 'common--sectionpadding',
					},
				)),

				// Active toggle box
				n.component(new ModelComponent(
					this.model,
					new LabelToggleBox(l10n.l('pageEditRoomScript.isActive', "Is active"), false, {
						className: 'common--formmargin',
						onChange: v => this.model.set({ active: v }),
					}),
					(m, c) => c.setValue(m.active, false),
				)),

				// Message
				n.component(this.message),

				// Footer
				n.elem('div', { className: 'pad-top-xl flex-row margin8 flex-end' }, [
					n.elem('div', { className: 'flex-1' }, [
						n.elem('update', 'button', { events: {
							click: () => this._save(),
						}, className: 'btn primary common--btnwidth' }, [
							n.component(new ModelTxt(this.model, m => m.isModified
								? l10n.l('pageEditRoomScript.update', "Save edits")
								: l10n.l('pageEditRoomScript.close', "Close"))),
						]),
					]),
					n.elem('button', { events: {
						click: () => this.module.confirm.open(() => this._delete(), {
							title: l10n.l('pageEditRoomScript.confirmDelete', "Confirm deletion"),
							body: l10n.l('pageEditRoomScript.deleteScriptBody', "Do you really wish to delete this room script?"),
							confirm: l10n.l('pageEditRoomScript.delete', "Delete"),
						}),
					}, className: 'iconbtn medium' }, [
						n.component(new FAIcon('trash')),
					]),
				]),
			])),
			(col, c, ev) => {
				// Check that the script still exists and close if not.
				let id = this.script.id;
				for (let p of col) {
					if (p.id === id) return;
				}
				this._close();
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
		if (this.model) {
			this.state.changes = this.model.getModifications() || {};
			this.model.dispose();
			this.model = null;
		}
	}

	_save() {
		this._setMessage();

		let p;
		if (!this.model) {
			p = Promise.resolve();
		} else {
			let change = this.model.getModifications();
			p = change
				? this.ctrl.call('setRoomScript', Object.assign(change, { scriptId: this.script.id }))
				: Promise.resolve();
		}

		return p.then(() => {
			this._close();
		}).catch(err => {
			this._setMessage(errToL10n(err));
		});
	}

	_setMessage(msg) {
		this.message.setComponent(msg
			? new Txt(msg, { className: 'dialog--error' })
			: null,
		);
	}

	_close() {
		this.close();
		if (this.model) {
			this.model.dispose();
			this.model = null;
		}
		this.state.changes = {};
	}

	_delete() {
		this.ctrl.call('deleteRoomScript', { scriptId: this.script.id })
			.then(() => this._close())
			.catch(err => this._setMessage(errToL10n(err)));
	}

	_copyAddressToClipboard() {
		copyToClipboard("#" + this.script.address).then(() => this.module.toaster.open({
			title: l10n.l('pageEditRoomScript.copiedToClipboard', "Copied to clipboard"),
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('pageEditRoomScript.copiedAddress', "Copied post address to clipboard."), { tagName: 'p' })),
			])),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		})).catch(err => this.module.toaster.openError(err, {
			title: l10n.l('pageEditRoomScript.failedToCopyToClipboard', "Failed to copy to clipboard"),
		}));
	}
}

export default PageEditRoomScriptComponent;
