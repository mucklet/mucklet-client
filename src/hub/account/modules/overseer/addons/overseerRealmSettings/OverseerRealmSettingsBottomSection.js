import { Elem, Input, Txt } from 'modapp-base-component';
import { ModelComponent, CollectionList } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import Collapser from 'components/Collapser';
import LabelToggleBox from 'components/LabelToggleBox';
import ModelCollapser from 'components/ModelCollapser';
import AutoComplete from 'components/AutoComplete';
import l10n from 'modapp-l10n';
import apiTypes from 'utils/apiTypes';

/**
 * OverseerRealmSettingsBottomSection draws the overseer edit form bottom section
 * for a realm.
 */
class OverseerRealmSettingsBottomSection {
	constructor(module, realm) {
		this.module = module;
		this.realm = realm;
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Elem(n => n.elem('div', { className: 'overseerrealmsettings' }, [

			n.elem('div', { className: 'common--hr' }),

			// Realm Client
			n.elem('div', { className: 'flex-row m pad16' }, [
				// Client Host
				n.component(new PanelSection(
					l10n.l('overseerRealmSettings.clientHost', "Client host"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ clientHost: c.getValue() }) },
							attributes: { name: 'overseerrealmsettings-clienthost', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.clientHost),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerRealmSettings.clientHostInfo', "Host name for the realm client. May contain port (eg. \"localhost:6450\")"),
					},
				)),

				// Client path
				n.component(new PanelSection(
					l10n.l('overseerRealmSettings.clientPath', "Client path"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ clientPath: c.getValue() }) },
							attributes: { name: 'overseerrealmsettings-clientpath', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.clientPath),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerRealmSettings.clientPathInfo', "Url path for the realm client. It is usually just a single slash (/)."),
					},
				)),

			]),

			// Client secure
			n.component(new ModelComponent(
				this.realm,
				new LabelToggleBox(l10n.l('overseerRealmSettings.clientUsesSslEncryption', "Client uses SSL encryption"), false, {
					className: 'common--formmargin flex-1',
					onChange: (v, c) => this.realm.set({ clientSecure: v }),
					popupTip: l10n.l('overseerRealmSettings.clientUsesSslEncryptionInfo', "Use https instead of http for the client connections."),
				}),
				(m, c) => c.setValue(m.clientSecure, false),
			)),

			n.elem('div', { className: 'common--hr' }),

			// API Node
			n.component(new PanelSection(
				l10n.l('overseerRealmSettings.apiNode', "API node"),
				new ModelComponent(
					this.realm,
					new AutoComplete({
						innerClassName: 'autocomplete-dark',
						attributes: {
							placeholder: l10n.t('routeReleases.searchRelease', "Search node (Keyname)"),
							name: 'overseerrealmsettings-apinode',
						},
						events: {
							input: (c, ev) => {
								this.realm.set({ apiNode: ev.target.value });
							},
						},
						fetch: (text, update) => {
							this.module.api.call(`control.overseer.nodes`, 'search', { text, limit: 20 })
								.then(nodes => {
									update(nodes.hits.map(o => Object.assign(o, {
										label: o.key,
									})));
								});
						},
						minLength: 1,
						onSelect: (c, item) => {
							c.setProperty('value', item.label);
							this.realm.set({ apiNode: item.key });
						},
					}),
					(m, c) => c.setProperty('value', m.apiNode),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('overseerRealmSettings.apiNodeInfo', "Server node that the realm is running on."),
				},
			)),

			// API type
			n.component(new PanelSection(
				l10n.l('overseerRealmSettings.apiType', "API type"),
				new CollectionList(
					apiTypes,
					v => new ModelComponent(
						this.realm,
						new Elem(n => n.elem('button', {
							events: {
								click: () => {
									this.realm.set({ apiType: v.key });
								},
							},
							className: 'btn tiny flex-1',
						}, [
							n.component(new Txt(v.text)),
						])),
						(m, c) => {
							c[v.key == m.apiType ? 'addClass' : 'removeClass']('primary');
							c[v.key != m.apiType ? 'addClass' : 'removeClass']('darken');
						},
					),
					{
						className: 'flex-row gap8',
						subClassName: () => 'overseerrealmsettings-bottomsection--apitype flex-row',
						horizontal: true,
					},
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('apiTypeSettings.apiTypeInfo', "Type of API installation. A manual realm is updated and handled manually, while a node realm is controlled by the system."),
				},
			)),

			// Realm API version settings
			n.component(new ModelCollapser(this.realm, [{
				condition: m => m.apiType == 'manual',
				factory: m => new Elem(n => n.elem('div', { className: 'flex-row m pad16 ' }, [
					// API version name
					n.component(new PanelSection(
						l10n.l('overseerRealmSettings.apiVersionName', "API version name"),
						new ModelComponent(
							this.realm,
							new Input("", {
								events: { input: c => this.realm.set({ apiVersionName: c.getValue() }) },
								attributes: { name: 'overseerrealmsettings-apiversionname', spellcheck: 'false' },
							}),
							(m, c) => c.setValue(m.apiVersionName),
						),
						{
							className: 'flex-1 common--sectionpadding',
							noToggle: true,
							popupTip: l10n.l('overseerRealmSettings.versionNameInfo', "Human readable version name of the release, such as \"1.23.4\" or \"1.24.0-rc1\"."),
						},
					)),

					// API version
					n.component(new PanelSection(
						l10n.l('overseerRealmSettings.apiVersion', "API version"),
						new ModelComponent(
							this.realm,
							new Input("", {
								events: { input: c => this.realm.set({ apiVersion: c.getValue() }) },
								attributes: { name: 'overseerrealmsettings-apiversion', spellcheck: 'false' },
							}),
							(m, c) => c.setValue(m.apiVersion),
						),
						{
							className: 'flex-1 common--sectionpadding',
							noToggle: true,
							popupTip: l10n.l('overseerRealmSettings.versionInfo', "Release version in the format \"MAJOR.MINOR.PATCH\"."),
						},
					)),
				])),
			}])),


			// Realm API
			n.elem('div', { className: 'flex-row m pad16 ' }, [
				// API Host
				n.component(new PanelSection(
					l10n.l('overseerRealmSettings.apiHost', "API host"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ apiHost: c.getValue() }) },
							attributes: { name: 'overseerrealmsettings-apihost', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.apiHost),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerRealmSettings.apiHostInfo', "Host name for the realm API. May contain port (eg. \"localhost:8080\")"),
					},
				)),

				// API path
				n.component(new PanelSection(
					l10n.l('overseerRealmSettings.apiPath', "API path"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ apiPath: c.getValue() }) },
							attributes: { name: 'overseerrealmsettings-apipath', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.apiPath),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerRealmSettings.apiPathInfo', "Url path for the realm API. It is usually just a single slash (/)."),
					},
				)),

				// API respource path
				n.component(new PanelSection(
					l10n.l('overseerRealmSettings.apiResourcePath', "API resource path"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ apiResourcePath: c.getValue() }) },
							attributes: { name: 'overseerrealmsettings-apiresourcepath', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.apiResourcePath),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerRealmSettings.apiResourcePathInfo', "Url path for the realm API for REST calls. It defaults to \"/api/\"."),
					},
				)),
			]),

			// Realm API file settings
			n.elem('div', { className: 'flex-row m pad16 ' }, [
				// API file host
				n.component(new PanelSection(
					l10n.l('overseerRealmSettings.apiFileHost', "File host"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ apiFileHost: c.getValue() }) },
							attributes: { name: 'overseerrealmsettings-apifilehost', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.apiFileHost),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerRealmSettings.apiFileHostInfo', "Host name for the realm API files. May contain port (eg. \"localhost:6452\")"),
					},
				)),

				// API file path
				n.component(new PanelSection(
					l10n.l('overseerRealmSettings.apiFilePath', "File path"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ apiFilePath: c.getValue() }) },
							attributes: { name: 'overseerrealmsettings-apifilepath', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.apiFilePath),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerRealmSettings.apiFilePathInfo', "Url path for the realm API files. It is usually just a single slash (/)."),
					},
				)),
			]),

			// Realm API file settings
			n.elem('div', { className: 'flex-row m pad16 ' }, [

				// API MSSP port
				n.component(new PanelSection(
					l10n.l('overseerRealmSettings.apiMsspPort', "MSSP port"),
					new ModelComponent(
						this.realm,
						new Input("", {
							attributes: {
								type: 'text',
								inputmode: 'numeric',
								maxlength: 8,
								autofocus: "",
							},
							events: {
								input: c => {
									let port = c.getValue().replace(/[^0-9]/, '');
									c.setValue(port);
									this.realm.set({ apiMsspPort: Number(port) || 0 });
								},
							},
						}),
						(m, c) => c.setValue(String(m.apiMsspPort)),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerRealmSettings.apiMsspPortInfo', "Port for the MSSP telnet protocol."),
					},
				)),
			]),

			// API secure
			n.component(new ModelComponent(
				this.realm,
				new LabelToggleBox(l10n.l('overseerRealmSettings.apiUsesSslEncryption', "API uses SSL encryption"), false, {
					className: 'common--formmargin flex-1',
					onChange: (v, c) => this.realm.set({ apiSecure: v }),
					popupTip: l10n.l('overseerRealmSettings.apiUsesSslEncryptionInfo', "Use https/wss instead of http/ws for the API connections."),
				}),
				(m, c) => c.setValue(m.apiSecure, false),
			)),

			n.elem('div', { className: 'common--hr' }),

			// Borg repo
			n.component(new PanelSection(
				l10n.l('overseerRealmSettings.borgRepo', "Borg repository"),
				new ModelComponent(
					this.realm,
					new Input("", {
						events: { input: c => this.realm.set({ borgRepo: c.getValue() }) },
						attributes: { name: 'overseerrealmsettings-borgrepo', spellcheck: 'false' },
					}),
					(m, c) => c.setValue(m.borgRepo),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('overseerRealmSettings.borgRepoInfo', "Borg backup repository URL."),
				},
			)),

			n.component(new PanelSection(
				l10n.l('overseerRealmSettings.borgPassphrase', "Borg passphrase"),
				new ModelComponent(
					this.realm,
					new Input("", {
						events: { input: c => this.realm.set({ borgPassphrase: c.getValue() }) },
						attributes: { name: 'overseerrealmsettings-borgpassphrase', spellcheck: 'false' },
					}),
					(m, c) => c.setValue(m.borgPassphrase),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('overseerRealmSettings.borgPassphraseInfo', "Borg backup repository passphrase. If left empty, a random passphrase will be generated."),
				},
			)),


		]));

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_callRealm(method) {
		this.module.api.call(`control.overseer.realm.${this.realm.id}`, method)
			.catch(err => this.module.confirm.openError(err));
	}
}

export default OverseerRealmSettingsBottomSection;
