import { Model } from 'modapp-resource';
import { isResError } from 'resclient';
import l10n from 'modapp-l10n';
import { relistenResource } from 'utils/listenResource';
import Err from 'classes/Err';
import { addBeforeUnload, removeBeforeUnload } from 'utils/reload';

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

		// Bind callbacks
		this._onBeforeUnload = this._onBeforeUnload.bind(this);

		this.app.require([
			'router',
			'auth',
			'api',
			'editorLayout',
			'confirm',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		/**
		 * @type {{
		 * 	router: import('modules/router/Router').default,
		 * 	auth: import('modules/auth/Auth').default,
		 * 	api: import('modules/auth/Api').default,
		* 	confirm: import('modules/confirm/Confirm').default,
		* 	toaster: import('modules/toaster/Toaster').default,
		 * 	editorLayout: import('../editorLayout/EditorLayout').default,
		 * }}
		 */
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: { roomScript: null, source: '', version: null, isModified: false }, eventBus: this.app.eventBus });

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
						// Store version in variables to avoid race issues if
						// version changes while fetching the source.
						let version = roomScript.version;
						return this.fetchRoomScriptSource(roomScript)
							.then(source => this._setState({ roomScript, source, version }))
							.finally(() => roomScript.off());
					})
					.catch(error => this._setState({ error }));
			},
			getUrl: params => this.module.router.createDefUrl(params, pathDef),
			parseUrl: parts => this.module.router.parseDefUrl(parts, pathDef),
			order: 10,
		});

		addBeforeUnload(this._onBeforeUnload);

		this.module.router.setDefault('editscript');
	}

	_setState(props) {
		props = props || {};
		return this.model.set({
			roomScript: relistenResource(this.model.roomScript, props.roomScript),
			source: props.source || '',
			version: props.version || null,
			isModified: this.model.roomScript == props.roomScript ? this.model.isModified : false,
			error: props.error || null,
		});
	}

	/**
	 * Fetches the source for a room script. If the room script contains no
	 * source (uses a binary file), or if an error occurrs, the promise will be
	 * rejected.
	 * @param {RoomScriptDetails} roomScript Room script details model.
	 */
	fetchRoomScriptSource(roomScript) {
		let source = roomScript.source;
		return (!source || isResError(source)
			? Promise.reject(source || new Err('editScript.noSource', "The room script source code is not available."))
			: this.module.auth.refreshTokens()
				.then(() => {
					return fetch(source.href, {
						credentials: 'include',
					}).then(response => {
						if (response.status >= 300) {
							throw response.text();
						};
						return response.text();
					}).catch(err => {
						throw new Err('dialogEditScriptSource.errorFetchingScript', "Error fetching script: {err}", { err: String(err) });
					});
				})
		);
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

	_onBeforeUnload(e) {
		if (this.model.isModified) {
			e = e || window.event;
			let msg = l10n.t('editScript.scriptIsModified', "Some script changes are not saved.");
			if (e) {
				e.returnValue = msg;
			}
			if (e.stopPropagation) {
				e.stopPropagation();
				e.preventDefault();
			}
			return msg;
		}
	}

	dispose() {
		this._setState(null, null);
		this.module.router.removeRoute('editscript');
		removeBeforeUnload(this._onBeforeUnload);
	}
}

export default EditScript;
