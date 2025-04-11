import { Collection, Model, sortOrderCompare } from 'modapp-resource';
import l10n from 'modapp-l10n';

import ScriptEditorComponent from './ScriptEditorComponent';
import './scriptEditor.scss';

/**
 * ScriptEditor adds the scriptEditor route.
 */
class ScriptEditor {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'router',
			'auth',
			'api',
			'editorLayout',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { alert: 0, user: null, ctx: null }, eventBus: this.app.eventBus });

		this.tools = new Collection({
			idAttribute: m => m.id,
			compare: sortOrderCompare,
			eventBus: this.app.eventBus,
		});

		this.module.router.addRoute({
			id: 'scriptEditor',
			name: l10n.l('scriptEditor.scriptEditor', "Script editor"),
			component: new ScriptEditorComponent(this.module, this.model),
			// staticRouteParams: { userId: null },
			setState: params => this.module.auth.getUserPromise().then(user => {
				// let ctx = {};
				// let promises = [];
				// for (let tool of this.tools) {
				// 	if (tool.createCtx) {
				// 		let o = {};
				// 		ctx[tool.id] = o;
				// 		promises.push(tool.createCtx(o, user));
				// 	}
				// }
				// return Promise.all(promises)
				// 	.then(() => this._setState(user, ctx))
				// 	.catch(err => {
				// 		this._disposeCtx(user, ctx);
				// 		throw err;
				// 	});
			}),
			// getUrl: params => null,
			// parseUrl: parts => null,
			order: 10,
		});

		this.module.router.setDefault('scriptEditor');
	}

	/**
	 * Gets a collection of tools.
	 * @returns {Collection} Collection of tools.
	 */
	getTools() {
		return this.tools;
	}

	/**
	 * Registers a settings component tool.
	 * @param {object} tool Tool object
	 * @param {string} tool.id Tool ID.
	 * @param {number} tool.sortOrder Sort order.
	 * @param {function} tool.componentFactory Tool component factory: function(user, paymentUser, state) -> Component
	 * @param {string} [tool.type] Target type. May be 'preference' 'topSection', or 'section'. Defaults to 'preference';
	 * @param {number} [tool.className] Class to give to the list item container.
	 * @param {Model} [tool.alertModel] Model with an "alert" property. If the alert property resolves to true, an marker will show on settings icon
	 * @param {function} [tool.createCtx] Function called prior to rendering the route: function(ctx, user) -> Promise
	 * @param {function} [tool.disposeCtx] Function called after unrendering the route: function(ctx, user)
	 * @returns {this}
	 */
	addTool(tool) {
		if (this.tools.get(tool.id)) {
			throw new Error("Tool ID already registered: ", tool.id);
		}
		this.tools.add(tool);
		this._listenTool(tool, true);
		return this;
	}

	/**
	 * Unregisters a previously registered tool.
	 * @param {string} toolId Tool ID.
	 * @returns {this}
	 */
	removeTool(toolId) {
		let tool = this.tools.get(toolId);
		this._listenTool(tool, false);
		this.tools.remove(toolId);
		return this;
	}

	dispose() {
		this._setState(null, null);
		this.module.router.removeRoute('scriptEditor');
	}
}

export default ScriptEditor;
