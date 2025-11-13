import { Model } from 'modapp-resource';
import { relistenResource } from 'utils/listenResource';
import Err from 'classes/Err';

import RouteTaskRunsComponent from './RouteTaskRunsComponent';
import types from './routeTaskRunsTypes';
import './routeTaskRuns.scss';

const errTaskRunNotFound = new Err('routeTaskRuns.taskRunNotFound', "TaskRun not found.");

/**
 * RouteTaskRuns adds the taskruns route.
 */
class RouteTaskRuns {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'router',
			'routeError',
			'auth',
			'confirm',
			'toaster',
			'routeRealms',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.models = {};

		for (let key in types) {
			let t = types[key];
			// Create model
			let m = new Model({ data: {
				project: null,
				taskRun: null,
				pageNr: null,
				step: null,
				error: null,
			}, eventBus: this.app.eventBus });
			this.models[key] = m;

			// Add route
			this.module.router.addRoute({
				id: t.id,
				icon: t.icon,
				name: t.name,
				parentId: t.parentId,
				component: new RouteTaskRunsComponent(this.module, t, m),
				setState: params => this._setState(t, m, params),
				getUrl: params => {
					const p = Object.assign({}, params);
					// Delete zero objects
					if (!p.pageNr || p.pageNr < 0) {
						delete p.pageNr;
					}
					if (!p.step || p.step < 0) {
						delete p.step;
					}
					return this.module.router.createDefUrl(params, t.pathDef);
				},
				parseUrl: parts => {
					let params = this.module.router.parseDefUrl(parts, t.pathDef);
					if (params?.pageNr) {
						params.pageNr = Number(params.pageNr);
						if (typeof params.pageNr != 'number' || params.pageNr < 0) {
							delete params.pageNr;
						}
					}
					if (params?.step) {
						params.step = Number(params.step);
						if (typeof params.step != 'number' || params.step < 0) {
							delete params.step;
						}
					}
					return params;
				},
				order: t.order,
			});
			// Init call
			t.init?.(this.module);
		}
	}

	/**
	 * Sets the route to the router.
	 * @param {"realm"|"node"} type Type of task run project
	 * @param {{
	 * 	taskRunId?: string;
	 * 	projectKey: string;
	 * }} params - Route parameters.
	 */
	setRoute(type, params) {
		let t = types[type];
		if (!t) {
			throw "Invalid project type: " + type;
		}
		if (!params.pageNr) {
			delete params.pageNr;
		}
		this.module.router.setRoute(t.id, params);
	}

	async _setState(type, model, params) {
		if (!params?.taskRunId && !params?.projectKey) {
			await Promise.resolve(type.setParentRoute(this.module));
			return;
		}

		try {
			if (params?.taskRunId) {
				const [ taskRun, taskRunSteps ] = await Promise.all([
					this.module.api.get(`control.taskrun.${params.taskRunId}`),
					this.module.api.get(`control.overseer.taskrun.${params.taskRunId}.steps`),
				]);
				if (taskRun.project.type != type.key) {
					throw errTaskRunNotFound;
				}
				const project = await type.fetchProject(this.module, taskRun.project.key);
				await this._setModel(model, { project, taskRun, taskRunSteps, pageNr: params.pageNr, step: params.step });
			} else {
				const project = await type.fetchProject(this.module, params.projectKey);
				await this._setModel(model, { project, pageNr: params.pageNr });
			}
		} catch (error) {
			console.error(error);
			await this._setModel(model, { error });
		}
	}

	_setModel(model, props = {}) {
		return model.set({
			project: relistenResource(model.project, props.project),
			taskRun: relistenResource(model.taskRun, props.taskRun),
			pageNr: props.pageNr || 0,
			step: typeof props.step == 'number' ? props.step : null,
			error: props.error || null,
		});
	}

	dispose() {
		for (let key in types) {
			this._setModel(this.models[key]);
			let t = types[key];
			t.dispose?.(this.module);
			this.module.router.removeRoute(t.id);
		}
		this.models = null;
	}
}

export default RouteTaskRuns;
