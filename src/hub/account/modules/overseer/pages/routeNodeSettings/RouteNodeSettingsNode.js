import { Elem, Txt, Context, Input } from 'modapp-base-component';
import { Model, ModifyModel, ModelToCollection, ModelWrapper } from 'modapp-resource';
import { ModelComponent, ModelTxt, CollectionList, CollectionComponent } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
import PageHeader from 'components/PageHeader';
import Collapser from 'components/Collapser';
import ModelFader from 'components/ModelFader';
import AutoComplete from 'components/AutoComplete';
import EnvEditor from 'components/EnvEditor';
import ProjectState from 'components/ProjectState';
import l10n from 'modapp-l10n';
import { getProjectState } from 'utils/projectStates';
import errString from 'utils/errString';
import RouteNodeSettingsRealmBadge from './RouteNodeSettingsRealmBadge';

/**
 * RouteNodeSettingsNode draws the settings form for a node.
 */
class RouteNodeSettingsNode {
	constructor(module, model, node) {
		this.module = module;
		this.model = model;
		this.node = node;
		this.realmModel = new Model({ data: { realmId: null }});
	}

	render(el) {
		this.messageComponent = new Collapser();
		let updateCollapser = new Collapser();

		this.elem = new Context(
			() => new ModifyModel(this.node, {
				eventBus: this.module.self.app.eventBus,
			}),
			(node) => node.dispose(),
			(node) => new Elem(n => n.elem('div', { className: 'routenodesettings-node' }, [
				n.elem('div', { className: 'flex-row flex-end' }, [
					n.component(new PageHeader(l10n.l('routeNodeSettings.nodeSettings', "Node settings"), "", { className: 'flex-1' })),
					n.elem('div', { className: 'flex-col' }, [
						n.elem('button', {
							className: 'btn fa small',
							events: {
								click: (c, ev) => {
									ev.stopPropagation();
									this.module.router.setRoute('nodes', { nodeId: this.node.id });
								},
							},
						}, [
							n.component(new FAIcon('angle-left')),
							n.component(new Txt(l10n.l('routeNodeSettings.backToNodes', "Back to Nodes"))),
						]),
					]),
				]),
				n.elem('div', { className: 'common--hr' }),

				// Key
				n.elem('div', { className: 'common--sectionpadding' }, [
					n.component(new ModelTxt(node, m => m.key, { className: 'routenodesettings-node--key' })),
				]),

				// Node state
				n.elem('div', { className: 'common--sectionpadding' }, [
					n.component(new ProjectState(this.node, {
						size: 'medium',
					})),
				]),

				// Update required
				n.component(new ModelComponent(
					this.node,
					new ModelComponent(
						null,
						updateCollapser,
						(m, c, change) => change && this._setUpdateCollapser(updateCollapser),
					),
					(m, c, change) => {
						c.setModel(m.composition);
						this._setUpdateCollapser(updateCollapser);
					},
				)),

				// Node node action buttons
				 n.elem('div', { className: 'flex-row m pad16' }, [
					// Node up
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.node,
							new Elem(n => n.elem('button', {
								className: 'btn primary small icon-left common--btnwidth',
								events: {
									click: () => this.module.self.nodeUp(this.node.key),
								},
							}, [
								n.component(new FAIcon('play')),
								n.component(new Txt(l10n.l('routeNodeSettings.nodeUp', "Node Up"))),
							])),
							(m, c) => {
								let state = getProjectState(m);
								c.setProperty('disabled', state.transitional || m.taskRun ? 'disabled' : null);
							},
						)),
					]),

					// Node stop
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.node,
							new Elem(n => n.elem('button', {
								className: 'btn secondary small icon-left common--btnwidth',
								events: {
									click: () => this.module.self.nodeStop(this.node.key),
								},
							}, [
								n.component(new FAIcon('pause')),
								n.component(new Txt(l10n.l('routeNodeSettings.nodeStop', "Node Stop"))),
							])),
							(m, c) => {
								let state = getProjectState(m);
								c.setProperty('disabled', state.transitional || m.taskRun ? 'disabled' : null);
							},
						)),
					]),

					// Node down
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.node,
							new Elem(n => n.elem('button', {
								className: 'btn warning small icon-left common--btnwidth',
								events: {
									click: () => this.module.self.nodeDown(this.node.key),
								},
							}, [
								n.component(new FAIcon('stop')),
								n.component(new Txt(l10n.l('routeNodeSettings.nodeDown', "Node Down"))),
							])),
							(m, c) => {
								let state = getProjectState(m);
								c.setProperty('disabled', state.transitional || m.taskRun ? 'disabled' : null);
							},
						)),
					]),
				]),

				// Node containers
				n.component(this.module.nodeContainers.newNodeContainers(this.node.containers, {
					className: 'routenodesettings-node--containers common--sectionpadding',
				})),

				// Active node realms
				n.component(new PanelSection(
					l10n.l('routeNodeSettings.realms', "Realms"),
					new Context(
						() => new ModelToCollection(this.node.activeRealms, {
							compare: (a, b) => a.value.key.localeCompare(b.value.key) || a.key.localeCompare(b.key),
							eventBus: this.module.self.eventBus,
						}),
						realms => realms.dispose(),
						realms => new Elem(n => n.elem('div', { className: 'routenodesettings-node' }, [
							n.component(new CollectionList(
								realms,
								m => new RouteNodeSettingsRealmBadge(this.module, m, this.realmModel),
								{
									className: 'routenodesettings-node--realms',
									subClassName: () => 'routenodesettings-node--realm',
								},
							)),
							n.component(new CollectionComponent(
								realms,
								new Collapser(),
								(col, c) => c.setComponent(col.length
									? null
									: c.getComponent() || new Txt(l10n.l('routeNodeSettings.noRealmsHosted', "No realms are currently hosted"), { className: 'common--placeholder' }),
								),
							)),
						])),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeNodeSettings.domainInfo', "Domain name of the node, such as \"localhost\" or \"server01.mucklet.com\"."),
					},
				)),

				n.elem('div', { className: 'common--hr' }),

				// Node Release
				n.component(new PanelSection(
					l10n.l('routeNodeSettings.nodeRelease', "Node release"),
					new ModelComponent(
						node,
						new AutoComplete({
							innerClassName: 'autocomplete-dark',
							attributes: {
								placeholder: l10n.t('routeNodeSettings.searchRelease', "Search release (Name)"),
								name: 'routenodesettings-node--release',
							},
							events: {
								input: (c, ev) => {
									if (!ev.target.value) {
										node.set({ release: null });
									}
								},
							},
							fetch: (text, update) => {
								this.module.api.call(`control.overseer.releases.node`, 'search', { text, limit: 20 })
									.then(releases => {
										update(releases.hits.map(o => Object.assign(o, {
											label: o.name,
										})));
									});
							},
							minLength: 1,
							onSelect: (c, item) => {
								c.setProperty('value', item.label);
								// Get the original model.
								node.set({ release: item.id == (this.node.release?.id)
									? this.node.release
									: item,
								});
							},
						}),
						(m, c) => c.setProperty('value', m.release?.name || ''),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeNodeSettings.releaseInfo', "The release of the common containers running on the node. Changing it will require the containers to be updated."),
					},
				)),

				// Domain
				n.component(new PanelSection(
					l10n.l('routeNodeSettings.domain', "Domain"),
					new ModelComponent(
						node,
						new Input("", {
							events: { input: c => node.set({ domain: c.getValue() }) },
							attributes: { name: 'routenodes-domain', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.domain),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeNodeSettings.domainInfo', "Domain name of the node, such as \"localhost\" or \"server01.mucklet.com\"."),
					},
				)),

				// IP
				n.component(new PanelSection(
					l10n.l('routeNodeSettings.ip', "IP address"),
					new ModelComponent(
						node,
						new Input("", {
							events: { input: c => node.set({ ip: c.getValue() }) },
							attributes: { name: 'routenodes-ip', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.ip),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeNodeSettings.ipInfo', "IP address of the node."),
					},
				)),

				n.elem('div', { className: 'common--hr' }),

				// Environment variables
				n.component(new PanelSection(
					l10n.l('routeNodeSettings.environmentVariables', "Environment variables"),
					new Context(
						() => new ModifyModel(new ModelWrapper(this.node.env), {
							isModifiedProperty: null,
							modifiedOnNew: true,
						}),
						(env) => env.dispose(),
						(env) => new ModelComponent(
							this.node,
							new ModelComponent(
								env,
								new EnvEditor(env),
								(m, c) => {
									// If the env ModifyModel has modifications, we
									// set those values as our node.env props.
									// Otherwise we set the original props.
									let mods = env.getModifications();
									node.set({ env: mods ? { ...env.props } : this.node.env });
								},
							),
							(m, c) => env.getModel().setModel(m.env),
						),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeNodeSettings.environmentVariablesInfo', "Values that may be used by the release templates to generate the composition."),
					},
				)),

				// Message
				n.component(this.messageComponent),

				// Footer
				n.elem('div', { className: 'pad-top-xl flex-row margin8 flex-end' }, [
					n.elem('div', { className: 'flex-1' }, [
						n.component(new ModelComponent(
							node,
							new Elem(n => n.elem('button', {
								className: 'btn primary common--btnwidth',
								events: {
									click: () => this._save(node),
								},
							}, [
								n.component(new Txt(l10n.l('routeNodeSettings.saveChanges', "Save changes"))),
							])),
							(m, c) => c.setProperty('disabled', m.isModified ? null : 'disabled'),
						)),
					]),

					// Footer tools
					n.elem('div', { className: 'flex-auto flex-row margin4 routenodesettings-node-footertools' }, [
						n.component(new ModelFader(node, [{
							condition: m => m.isDefault,
							factory: m => new Elem(n => n.elem('div', { className: 'pad-right-l' }, [
								n.elem('button', { events: {
									click: () => this._callNode('updateDefaultNode')
										.then(() => this.module.toaster.open({
											title: l10n.l('routeNodeSettings.nodeRefreshed', "Node refreshed"),
											content: new Txt(l10n.l('routeNodeSettings.nodeRefreshedBody', "Node settings has been refreshed from config.")),
											closeOn: 'click',
											type: 'success',
											autoclose: true,
										})),
								}, className: 'iconbtn medium solid' }, [
									n.component(new FAIcon('refresh')),
								]),
							])),
						}])),

						n.elem('button', { events: {
							click: () => this.module.confirm.open(() => this._callNode('delete'), {
								title: l10n.l('routeNodeSettings.confirmDelete', "Confirm deletion"),
								body: l10n.l('routeNodeSettings.deleteNodeBody', "Do you really wish to delete this node?"),
								confirm: l10n.l('routeNodeSettings.delete', "Delete"),
							}),
						}, className: 'iconbtn medium solid' }, [
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

		// Prepare params for release.
		if (params.hasOwnProperty('release')) {
			params.releaseId = params.release?.id || null;
			delete params.release;
		}

		this._setMessage();
		return this.node.call('set', params).then(() => {
			model.reset();
		}).catch(err => {
			this._setMessage(errString(err));
		});
	}

	_setMessage(msg) {
		this.messageComponent?.setComponent(msg
			? new Txt(msg, { className: 'dialog--error' })
			: null,
		);
	}

	_callNode(method, params) {
		return this.module.api.call(`control.overseer.node.${this.node.key}`, method, params)
			.catch(err => this.module.confirm.openError(err));
	}

	_setUpdateCollapser(collapser) {
		let show = this.node.state != 'offline' &&
			this.node.composition &&
			this.node.composition.configHash != this.node.configHash;

		collapser.setComponent(show
			? collapser.getComponent() || new Txt(l10n.l('routeNodeSettings.updateRequired', "Update required"), { className: 'routenodesettings-node--updaterequired' })
			: null,
		);
	}
}

export default RouteNodeSettingsNode;
