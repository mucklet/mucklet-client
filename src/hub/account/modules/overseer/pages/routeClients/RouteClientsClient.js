import { Elem, Txt, Context, Input } from 'modapp-base-component';
import { ModifyModel } from 'modapp-resource';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
import PageHeader from 'components/PageHeader';
import Collapser from 'components/Collapser';
import ModelCollapser from 'components/ModelCollapser';
import l10n from 'modapp-l10n';
import errString from 'utils/errString';
import FileButton from 'components/FileButton';
import DefinitionList from 'components/DefinitionList';
import exportFile from 'utils/exportFile';
import formatByteSize from 'utils/formatByteSize';
import ModelFader from 'components/ModelFader';

/**
 * RouteClientsClient draws the settings form for a client.
 */
class RouteClientsClient {
	constructor(module, client) {
		this.module = module;
		this.client = client;
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Context(
			() => new ModifyModel(this.client, {
				eventBus: this.module.self.app.eventBus,
			}),
			client => client.dispose(),
			client => new Elem(n => n.elem('div', { className: 'routeclients-client' }, [
				n.elem('div', { className: 'flex-row flex-end' }, [

					// Header
					n.component(new PageHeader(l10n.l('routeClients.clientRelease', "Client release"), "", { className: 'flex-1' })),

					// Back navigation
					n.elem('div', { className: 'flex-col' }, [
						n.elem('button', {
							className: 'btn fa small',
							events: {
								click: (c, ev) => {
									ev.stopPropagation();
									this.module.self.setRoute();
								},
							},
						}, [
							n.component(new FAIcon('angle-left')),
							n.component(new Txt(l10n.l('routeClients.backToClients', "Back to Clients"))),
						]),
					]),
				]),
				n.elem('div', { className: 'common--hr' }),


				// Name
				n.component(new PanelSection(
					l10n.l('routeClients.name', "Name"),
					new ModelComponent(
						client,
						new Input("", {
							events: { input: c => client.set({ name: c.getValue() }) },
							attributes: { name: 'routeclients-name', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.name),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeClients.nameInfo', "Human readable version name of the client, such as \"1.23.4\" or \"1.24.0-rc1\"."),
					},
				)),

				// Version
				n.component(new PanelSection(
					l10n.l('routeClients.version', "Version"),
					new ModelComponent(
						client,
						new Input("", {
							events: { input: c => client.set({ version: c.getValue() }) },
							attributes: { name: 'routeclients-version', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.version),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeClients.versionInfo', "Client version in the format \"MAJOR.MINOR.PATCH\"."),
					},
				)),

				// Client files
				n.component(new PanelSection(
					l10n.l('routeClients.clientFiles', "Client files"),
					new Elem(n => n.elem('div', [
						// Client info
						n.component(new ModelCollapser(this.client, [{
							condition: m => m.files,
							factory: m => new Elem(n => n.elem('div', { className: 'flex-row' }, [
								n.component(new DefinitionList([
									{
										title: l10n.l('pageCustomTheme.archive', "Archive"),
										component: new ModelComponent(
											this.client,
											new ModelFader(null, [
												{
													condition: m => m?.mime,
													factory: m => new ModelComponent(
														m,
														new Txt('', {
															tagName: 'a',
															className: 'link',
															attributes: { download: true },
														}),
														(m, c) => {
															c.setText(m.filename);
															c.setAttribute('href', m.href);
														},
													),
												},
												{
													factory: m => new ModelTxt(m, m => m.filename),
												},
											]),
											(m, c) => {
												if (m.archive?.filename || m.files) {
													c.setModel(m.archive?.filename
														? m.archive
														: m.files,
													);
												}
											},
										),
									},
									{
										title: l10n.l('pageCustomTheme.size', "Size"),
										component: new ModelTxt(this.client.files, m => formatByteSize(m.archiveSize)),
									},
									{
										title: l10n.l('pageCustomTheme.files', "Files"),
										component: new ModelTxt(this.client.files, m => String(m.fileCount)),
									},
									{
										title: l10n.l('pageCustomTheme.files', "Total size"),
										component: new ModelTxt(this.client.files, m => formatByteSize(m.totalSize)),
									},
								], { className: 'flex-1' })),

								// Files tools
								n.elem('div', { className: 'flex-auto flex-self-end' }, [
									n.elem('button', { className: 'iconbtn small filled', events: {
										click: (el, e) => {
											this._deleteFiles();
											e.stopPropagation();
										},
									}}, [
										n.component(new FAIcon('trash')),
									]),
								]),

							])),
						}])),

						// No files placeholder
						n.component(new ModelCollapser(this.client, [{
							condition: m => !m.files,
							factory: m => new Txt(l10n.l('pageCustomTheme.noFilesUploaded', "No files are uploaded"), { className: 'common--nolistplaceholder' }),
						}])),
					])),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),

				// Theme tokens
				n.component(new PanelSection(
					l10n.l('routeClients.themeTokens', "Theme tokens"),
					new Elem(n => n.elem('div', [
						// Token info
						n.component(new ModelCollapser(this.client, [{
							condition: m => m.themeTokens && Object.keys(m.themeTokens).some(k => m.themeTokens[k]),
							factory: m => new Elem(n => n.elem('div', { className: 'flex-row' }, [
								n.component(new DefinitionList([
									{
										title: l10n.l('pageCustomTheme.rgbTokens', "RGB tokens"),
										component: new ModelTxt(this.client, m => {
											let tt = m.themeTokens || {};
											return String(Object.keys(tt).filter(k => tt[k].type == 'rgb').length);
										}),
									},
									{
										title: l10n.l('pageCustomTheme.rgbaTokens', "RGBA tokens"),
										component: new ModelTxt(this.client, m => {
											let tt = m.themeTokens || {};
											return String(Object.keys(tt).filter(k => tt[k].type == 'rgba').length);
										}),
									},
								], { className: 'flex-1' })),

								// Theme tokens tools
								n.elem('div', { className: 'flex-auto flex-self-end' }, [
									n.elem('button', { className: 'iconbtn small filled', events: {
										click: (el, e) => {
											this._exportTokens();
											e.stopPropagation();
										},
									}}, [
										n.component(new FAIcon('download')),
									]),
								]),
							])),
						}])),

						// No tokens placeholder
						n.component(new ModelCollapser(this.client, [{
							condition: m => !m.themeTokens || !Object.keys(m.themeTokens).some(k => m.themeTokens[k]),
							factory: m => new Txt(l10n.l('pageCustomTheme.noTokensUploaded', "No theme tokens are uploaded"), { className: 'common--nolistplaceholder' }),
						}])),
					])),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),

				// Message
				n.component(this.messageComponent),

				// Footer
				n.elem('div', { className: 'pad-top-xl flex-row margin8 flex-end' }, [
					n.elem('div', { className: 'flex-1' }, [

						n.elem('div', { className: 'flex-row margin16' }, [

							// Save changes
							n.component(new ModelComponent(
								client,
								new Elem(n => n.elem('button', {
									className: 'btn primary common--btnwidth',
									events: {
										click: () => this._save(client),
									},
								}, [
									n.component(new Txt(l10n.l('routeClients.saveChanges', "Save changes"))),
								])),
								(m, c) => c.setProperty('disabled', m.isModified ? null : 'disabled'),
							)),

							// Upload zip-file
							n.component(new FileButton(
								new Elem(n => n.elem('div', [
									n.component(new FAIcon('file-archive-o ')),
									n.component(new Txt(l10n.l('routeClients.uploadZipFile', "Upload ZIP-file"))),
								])),
								(file) => this._trySetClientFiles(file),
								{
									className: 'btn icon-left',
									noFileReader: true,
								},
							)),

							// Upload templates
							n.component(new FileButton(
								new Elem(n => n.elem('div', [
									n.component(new FAIcon('file-code-o ')),
									n.component(new Txt(l10n.l('routeClients.uploadTokens', "Upload tokens"))),
								])),
								(file, json) => this._setThemeTokens(json),
								{
									className: 'btn icon-left',
									asText: true,
								},
							)),

						]),

					]),

					// Footer tools
					n.elem('div', { className: 'flex-auto flex-row margin4 routeclients-client-footertools' }, [
						// Delete
						n.elem('button', { events: {
							click: () => this.module.confirm.open(() => this._callClient('delete')
								.then(() => {
									this.module.self.setRoute(this.client.type);
									this.module.toaster.open({
										title: l10n.l('routeClients.clientDeleted', "Client deleted"),
										content: new Elem(n => n.elem('div', [
											n.component(new Txt(l10n.l('routeClients.clientDeletedBody', "Client was successfully deleted:"), { tagName: 'p' })),
											n.component(new Txt(this.client.name, { tagName: 'p', className: 'dialog--strong' })),
										])),
										closeOn: 'click',
										type: 'success',
										autoclose: true,
									});
								}),
							{
								title: l10n.l('routeClients.confirmDelete', "Confirm deletion"),
								body: l10n.l('routeClients.deleteClientBody', "Do you really wish to delete this client release?"),
								confirm: l10n.l('routeClients.delete', "Delete"),
							}),
						}, className: 'iconbtn medium filled' }, [
							n.component(new FAIcon('trash')),
						]),
					]),
				]),

			])),
		);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.messageComponent = null;
		}
	}

	_save(model) {
		let params = model.getModifications();
		if (!params) {
			return;
		}

		this._setMessage();
		return this._callClient('set', params).then(() => {
			model.reset();
		}).catch(err => {
			this._setMessage(errString(err));
		});
	}

	_trySetClientFiles(file) {
		// If we already have files, show warning.
		if (this.client.files) {
			this.module.confirm.open(() => this._setClientFiles(file), {
				title: l10n.l('routeClients.confirmReplaceFiles', "Confirm replace files"),
				body: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('routeClients.confirmReplaceFilesBody', "Do you really wish to replace the existing client files? "), { tagName: 'p' })),
					n.elem('p', { className: 'dialog--error' }, [
						n.component(new FAIcon('exclamation-triangle')),
						n.html("&nbsp;&nbsp;"),
						n.component(new Txt(l10n.l('routeClients.confirmReplaceFilesWarning', "Files may be used by realms."))),
					]),
				])),
				confirm: l10n.l('routeClients.replace', "Replace"),
			});
		} else {
			this._setClientFiles(file);
		}
	}

	_setClientFiles(file) {
		this._setMessage();
		return this.module.file.upload(file, 'control.upload.clientArchive')
			.then(result => this._callClient('setFiles', {
				uploadId: result.uploadId,
			})).then(() => this.module.toaster.open({
				title: l10n.l('routeClients.files', "Files uploaded"),
				content: new Txt(l10n.l('routeClients.filesBody', "Files were successfully extracted after upload.")),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			})).catch(err => this._setMessage(errString(err)));
	}

	_setThemeTokens(json) {
		let themeTokens;
		try {
			themeTokens = JSON.parse(json);
			if (!themeTokens || typeof themeTokens != 'object') {
				throw "not an object";
			}
		} catch (err) {
			console.error("Invalid token file: ", err);
			this._setMessage(l10n.l('routeClients.invalidTokensFile', "Token file is invalid."));
			return;
		}

		this._setMessage();
		this._callClient('set', { themeTokens }).catch(err => {
			this._setMessage(errString(err));
		});
	}

	_setMessage(msg) {
		this.messageComponent?.setComponent(msg
			? new Txt(msg, { className: 'dialog--error' })
			: null,
		);
	}

	_callClient(method, params) {
		return this.module.api.call(`control.overseer.client.${this.client.id}`, method, params);
	}

	_exportTokens() {
		let tokens = this.client.themeTokens || {};
		let filename = 'client_tokens_' + this.client.name + '.json';
		exportFile(filename, JSON.stringify(tokens, null, 2), 'application/json');
	}

	_deleteFiles() {
		if (!this.client.files) {
			return;
		}

		this.module.confirm.open(() => this._callClient('deleteFiles')
			.catch(err => this.module.toaster.openError(err)),
		{
			title: l10n.l('routeClients.confirmDeleteFiles', "Confirm delete files"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('routeClients.confirmDeleteFilesBody', "Do you really wish to delete the client files? "), { tagName: 'p' })),
				n.elem('p', { className: 'dialog--error' }, [
					n.component(new FAIcon('exclamation-triangle')),
					n.html("&nbsp;&nbsp;"),
					n.component(new Txt(l10n.l('routeClients.confirmDeleteFilesWarning', "Files may be used by realms."))),
				]),
			])),
			confirm: l10n.l('routeClients.delete', "Delete"),
		});
	}
}

export default RouteClientsClient;
