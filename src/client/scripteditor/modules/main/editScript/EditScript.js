import { Model } from 'modapp-resource';
import { isResError } from 'resclient';
import l10n from 'modapp-l10n';
import { relistenResource } from 'utils/listenResource';
import Err from 'classes/Err';

import EditScriptContainer from './EditScriptContainer';
import './editScript.scss';

const pathDef = [
	[ '$scriptId' ],
];

/**
 * EditScript adds the editScript route.
 */
class EditScript {

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
		/**
		 * @type {{
		 * 	router: import('modules/router/Router').default,
		 * 	auth: import('modules/auth/Auth').default,
		 * 	api: import('modules/auth/Api').default,
		 * 	editorLayout: import('../editorLayout/EditorLayout').default,
		 * }}
		 */
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { roomScript: null, source: '' }, eventBus: this.app.eventBus });

		this.module.router.addRoute({
			id: 'editscript',
			name: l10n.l('editScript.editScript', "Script editor"),
			component: new EditScriptContainer(this.module, this.model),
			setState: params => {
				// No script
				if (!params.scriptId) {
					return this._setState({});
				}
				// Fetch script
				return this.module.auth.getUserPromise()
					.then(user => this.module.api.get(`core.roomscript.${params.scriptId}.details`))
					.then(roomScript => {
						roomScript.on();
						return (!roomScript.source || isResError(roomScript.source)
							? Promise.reject(roomScript.source || new Err('editScript.noSource', "The room script source code is not available."))
							: this.module.auth.refreshTokens()
								.then(() => {
									return fetch(roomScript.source.href, {
										credentials: 'include',
									}).then(response => {
										if (response.status >= 300) {
											throw response.text();
										};
										return response.text()
											.then(source => this._setState({ roomScript, source }));
									}).catch(err => {
										throw new Err('dialogEditScriptSource.errorFetchingScript', "Error fetching script: {err}", { err: String(err) });
									});
								})
						).finally(() => roomScript.off());
					})
					.catch(error => this._setState({ error }));
			},
			getUrl: params => this.module.router.createDefUrl(params, pathDef),
			parseUrl: parts => this.module.router.parseDefUrl(parts, pathDef),
			order: 10,
		});

		this.module.router.setDefault('editscript');
	}

	_setState(props) {
		props = props || {};
		return this.model.set({
			roomScript: relistenResource(this.model.roomScript, props.roomScript),
			source: props.source || '',
			error: props.error || null,
		});
	}

	/**
	 * Sets the script route.
	 * @param {object} params Route params.
	 * @param {string} [params.scriptId] Script ID.
	 */
	setRoute(params) {
		this.module.router.setRoute('editscript', {
			scriptId: params?.scriptId || null,
		});
	}

	dispose() {
		this._setState(null, null);
		this.module.router.removeRoute('editscript');
	}
}

export default EditScript;
