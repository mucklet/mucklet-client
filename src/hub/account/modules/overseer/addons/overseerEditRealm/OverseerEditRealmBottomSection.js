import { Elem, Input } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import Collapser from 'components/Collapser';
import LabelToggleBox from 'components/LabelToggleBox';
import l10n from 'modapp-l10n';

/**
 * OverseerEditRealmBottomSection draws the overseer edit form bottom section
 * for a realm.
 */
class OverseerEditRealmBottomSection {
	constructor(module, realm) {
		this.module = module;
		this.realm = realm;
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Elem(n => n.elem('div', { className: 'overseereditrealm' }, [

			n.elem('div', { className: 'common--hr' }),

			// Realm Client
			n.elem('div', { className: 'flex-row m pad16 ' }, [
				// Client Host
				n.component(new PanelSection(
					l10n.l('overseerEditRealm.clientHost', "Client host"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ clientHost: c.getValue() }) },
							attributes: { name: 'routeeditrealm-clienthost', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.clientHost),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerEditRealm.clientHostInfo', "Host name for the realm client. May contain port (eg. \"localhost:6450\")"),
					},
				)),

				// Client path
				n.component(new PanelSection(
					l10n.l('overseerEditRealm.clientPath', "Client path"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ clientPath: c.getValue() }) },
							attributes: { name: 'routeeditrealm-clientpath', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.clientPath),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerEditRealm.clientPathInfo', "Url path for the realm client. It is usually just a single slash (/)."),
					},
				)),

			]),

			// Client secure
			n.component(new ModelComponent(
				this.realm,
				new LabelToggleBox(l10n.l('overseerEditRealm.clientUsesSslEncryption', "Client uses SSL encryption"), false, {
					className: 'common--formmargin flex-1',
					onChange: (v, c) => this.realm.set({ clientSecure: v }),
					popupTip: l10n.l('overseerEditRealm.clientUsesSslEncryptionInfo', "Use https instead of http for the client connections."),
				}),
				(m, c) => c.setValue(m.clientSecure, false),
			)),

			n.elem('div', { className: 'common--hr' }),

			// API Node
			n.component(new PanelSection(
				l10n.l('overseerEditRealm.apiNode', "API node"),
				new ModelComponent(
					this.realm,
					new Input("", {
						events: { input: c => this.realm.set({ apiNode: c.getValue() }) },
						attributes: { name: 'routeeditrealm-apinode', spellcheck: 'false' },
					}),
					(m, c) => c.setValue(m.apiNode),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('overseerEditRealm.apiNodeInfo', "Server node that the realm is running on."),
				},
			)),


			// Realm API
			n.elem('div', { className: 'flex-row m pad16 ' }, [
				// API Host
				n.component(new PanelSection(
					l10n.l('overseerEditRealm.apiHost', "API host"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ apiHost: c.getValue() }) },
							attributes: { name: 'routeeditrealm-apihost', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.apiHost),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerEditRealm.apiHostInfo', "Host name for the realm API. May contain port (eg. \"localhost:8080\")"),
					},
				)),

				// API path
				n.component(new PanelSection(
					l10n.l('overseerEditRealm.apiPath', "API path"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ apiPath: c.getValue() }) },
							attributes: { name: 'routeeditrealm-apipath', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.apiPath),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerEditRealm.apiPathInfo', "Url path for the realm API. It is usually just a single slash (/)."),
					},
				)),

				// API respource path
				n.component(new PanelSection(
					l10n.l('overseerEditRealm.apiResourcePath', "API resource path"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ apiResourcePath: c.getValue() }) },
							attributes: { name: 'routeeditrealm-apiresourcepath', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.apiResourcePath),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerEditRealm.apiResourcePathInfo', "Url path for the realm API for REST calls. It defaults to \"/api/\"."),
					},
				)),
			]),

			// Realm API file settings
			n.elem('div', { className: 'flex-row m pad16 ' }, [
				// API file host
				n.component(new PanelSection(
					l10n.l('overseerEditRealm.apiFileHost', "File host"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ apiFileHost: c.getValue() }) },
							attributes: { name: 'routeeditrealm-apifilehost', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.apiFileHost),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerEditRealm.apiFileHostInfo', "Host name for the realm API files. May contain port (eg. \"localhost:6452\")"),
					},
				)),

				// API file path
				n.component(new PanelSection(
					l10n.l('overseerEditRealm.apiFilePath', "File path"),
					new ModelComponent(
						this.realm,
						new Input("", {
							events: { input: c => this.realm.set({ apiFilePath: c.getValue() }) },
							attributes: { name: 'routeeditrealm-apifilepath', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.apiFilePath),
					),
					{
						className: 'flex-1 common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('overseerEditRealm.apiFilePathInfo', "Url path for the realm API files. It is usually just a single slash (/)."),
					},
				)),
			]),

			// Realm API file settings
			n.elem('div', { className: 'flex-row m pad16 ' }, [

				// API MSSP port
				n.component(new PanelSection(
					l10n.l('overseerEditRealm.apiMsspPort', "MSSP port"),
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
						popupTip: l10n.l('overseerEditRealm.apiMsspPortInfo', "Port for the MSSP telnet protocol."),
					},
				)),
			]),

			// API secure
			n.component(new ModelComponent(
				this.realm,
				new LabelToggleBox(l10n.l('overseerEditRealm.apiUsesSslEncryption', "API uses SSL encryption"), false, {
					className: 'common--formmargin flex-1',
					onChange: (v, c) => this.realm.set({ apiSecure: v }),
					popupTip: l10n.l('overseerEditRealm.apiUsesSslEncryptionInfo', "Use https/wss instead of http/ws for the API connections."),
				}),
				(m, c) => c.setValue(m.apiSecure, false),
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

export default OverseerEditRealmBottomSection;
