import { Elem, Txt } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import { relistenResource } from 'utils/listenResource';
import errToL10n from 'utils/errToL10n';
import taskRunDone from 'utils/taskRunDone';
import { getProjectState } from 'utils/projectStates';

import RouteNodeSettingsComponent from './RouteNodeSettingsComponent';
import './routeNodeSettings.scss';

const pathDef = [
	[ 'node', '$nodeKey' ],
];

const callNodeMethods = {
	up: {
		error: {
			title: l10n.l('routeNodeSettings.nodeUpFailed', "Node Up Failed"),
			body: l10n.l('routeNodeSettings.nodeUpFailedBody', "An error occurrent on Node Up:"),
		},
		success: {
			title: l10n.l('routeNodeSettings.nodeUp', "Node Up"),
			body: l10n.l('routeNodeSettings.nodeUpFailedBody', "Node Up completed successfully."),
		},
	},
	down: {
		error: {
			title: l10n.l('routeNodeSettings.nodeDownFailed', "Node Down Failed"),
			body: l10n.l('routeNodeSettings.nodeDownFailedBody', "An error occurrent on Node Down:"),
		},
		success: {
			title: l10n.l('routeNodeSettings.nodeDown', "Node Down"),
			body: l10n.l('routeNodeSettings.nodeDownFailedBody', "Node Down completed successfully."),
		},
	},
	stop: {
		error: {
			title: l10n.l('routeNodeSettings.nodeStopFailed', "Node Stop Failed"),
			body: l10n.l('routeNodeSettings.nodeStopFailedBody', "An error occurrent on Node Stop:"),
		},
		success: {
			title: l10n.l('routeNodeSettings.nodeStop', "Node Stop"),
			body: l10n.l('routeNodeSettings.nodeStopFailedBody', "Node Stop completed successfully."),
		},
	},
};

/**
 * RouteNodeSettings adds the nodes route.
 */
class RouteNodeSettings {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'router',
			'routeError',
			'auth',
			'access',
			'confirm',
			'toaster',
			'routeRealmSettings',
			'nodeContainers',
			'routeNodes',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			node: null,
			error: null,
		}, eventBus: this.app.eventBus });

		this.module.router.addRoute({
			id: 'nodesettings',
			hidden: true,
			parentId: 'nodes',
			icon: 'university',
			name: l10n.l('routeNodeSettings.nodeSettings', "Node Settings"),
			component: new RouteNodeSettingsComponent(this.module, this.model),
			setState: params => this._setState(params),
			getUrl: params => this.module.router.createDefUrl(params, pathDef),
			parseUrl: parts => this.module.router.parseDefUrl(parts, pathDef),
			order: 20,
		});


		this.module.routeNodes.addTool({
			id: 'nodeSettings-control',
			type: 'button',
			sortOrder: 10,
			className: 'flex-1',
			componentFactory: (node) => new Elem(n => n.elem('div', { className: 'badge--select badge--select-margin' }, [
				// Node up
				n.elem('div', { className: 'flex-1' }, [
					n.component(new ModelComponent(
						node,
						new Elem(n => n.elem('button', {
							className: 'btn primary medium icon-left full-width',
							events: {
								click: (c, ev) => {
									ev.stopPropagation();
									this.nodeUp(node.key);
								},
							},
						}, [
							n.component(new FAIcon('play')),
							n.component(new Txt(l10n.l('routeNodeSettings.nodeUp', "Node Up"))),
						])),
						(m, c) => {
							let state = getProjectState(m);
							c.setProperty('disabled', state.transitional ? 'disabled' : null);
						},
					)),
				]),

				// Node stop
				n.elem('div', { className: 'flex-1' }, [
					n.component(new ModelComponent(
						node,
						new Elem(n => n.elem('button', {
							className: 'btn secondary medium icon-left full-width',
							events: {
								click: (c, ev) => {
									ev.stopPropagation();
									this.module.self.nodeStop(node.key);
								},
							},
						}, [
							n.component(new FAIcon('pause')),
							n.component(new Txt(l10n.l('routeNodeSettings.nodeStop', "Node Stop"))),
						])),
						(m, c) => {
							let state = getProjectState(m);
							c.setProperty('disabled', state.transitional ? 'disabled' : null);
						},
					)),
				]),

				// Node down
				n.elem('div', { className: 'flex-1' }, [
					n.component(new ModelComponent(
						node,
						new Elem(n => n.elem('button', {
							className: 'btn warning medium icon-left full-width',
							events: {
								click: (c, ev) => {
									ev.stopPropagation();
									this.module.self.nodeDown(node.key);
								},
							},
						}, [
							n.component(new FAIcon('stop')),
							n.component(new Txt(l10n.l('routeNodeSettings.nodeDown', "Node Down"))),
						])),
						(m, c) => {
							let state = getProjectState(m);
							c.setProperty('disabled', state.transitional ? 'disabled' : null);
						},
					)),
				]),
			])),
		});

		this.module.routeNodes.addTool({
			id: 'nodeSettings-link',
			type: 'button',
			sortOrder: 200,
			componentFactory: (node) => new Elem(n => n.elem('button', { className: 'iconbtn medium solid', events: {
				click: (c, ev) => {
					ev.stopPropagation();
					this.setRoute({ nodeKey: node.key });
				},
			}}, [
				n.component(new FAIcon('cog')),
			])),
		});
	}

	/**
	 * Sets the route to the router.
	 * @param {{
	 * 	nodeKey?: string;
	 * }} params - Route parameters.
	 */
	setRoute(params) {
		this.module.router.setRoute('nodesettings', params);
	}

	/**
	 * Runs Node Up and shows toasters on completion.
	 * @param {string} nodeKey Node key.
	 */
	nodeUp(nodeKey) {
		this._callNode(nodeKey, 'up');
	}

	/**
	 * Runs Node Stop and shows toasters on completion.
	 * @param {string} nodeKey Node key.
	 */
	nodeStop(nodeKey) {
		this._callNode(nodeKey, 'stop');
	}

	/**
	 * Runs Node Down and shows toasters on completion.
	 * @param {string} nodeKey Node key.
	 */
	nodeDown(nodeKey) {
		this._callNode(nodeKey, 'down');
	}

	async _setState(params) {
		return this.module.auth.getUserPromise()
			.then(user => params?.nodeKey
				? this.module.api.get(`control.overseer.node.${params.nodeKey}`)
				: Promise.resolve(null),
			)
			.then(node => this._setModel({ node }))
			.catch(error => {
				console.error(error);
				return this._setModel({ error });
			});
	}

	_setModel(props) {
		props = props || {};
		return this.model.set({
			node: relistenResource(this.model.node, props.node),
			error: props.error || null,
		});
	}

	_callNode(nodeKey, method, params) {
		return this.module.api.call(`control.overseer.node.${nodeKey}`, method, params)
			.then((taskRun) => {
				let o = callNodeMethods[method];
				// Only give toaster feedback for up, down, and stop calls.
				if (!o) {
					return;
				}

				taskRunDone(taskRun, (m) => {
					if (taskRun.error) {
						this.module.toaster.open({
							title: o.error.title,
							content: new Elem(n => n.elem('div', [
								n.component(new Txt(o.error.body, { tagName: 'p' })),
								n.component(new Txt(errToL10n(taskRun.error), { tagName: 'p', className: 'common--font-small common--pre-wrap' })),
							])),
							closeOn: 'click',
							type: 'warn',
						});
					} else {
						this.module.toaster.open({
							title: o.success.title,
							content: new Txt(o.success.body),
							closeOn: 'click',
							type: 'success',
							autoclose: true,
						});
					}
				});
			})
			.catch(err => this.module.toaster.openError(err));
	}

	dispose() {
		this.module.router.removeRoute('nodesettings-link');
		this.module.router.removeRoute('nodesettings-control');
	}
}

export default RouteNodeSettings;
