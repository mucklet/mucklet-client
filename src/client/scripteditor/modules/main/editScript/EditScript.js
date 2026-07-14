import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import { relistenResource } from 'utils/listenResource';
import fetchRoomScriptSource from 'utils/fetchRoomScriptSource';
import { addBeforeUnload, removeBeforeUnload } from 'utils/reload';

import EditScriptContainer from './EditScriptContainer';
import './editScript.scss';

const themeTokens = {
	'editscript.keyword.fg': (getToken) => getToken('content.accent.fg'),
	'editscript.name.fg': (getToken) => getToken('content.strong.fg'),
	'editscript.variable.fg': (getToken) => getToken('content.strong.fg'),
	'editscript.constant.fg': (getToken) => getToken('content.strong.fg'),
	'editscript.separator.fg': (getToken) => getToken('content.strong.fg'),
	'editscript.type.fg': (getToken) => getToken('content.accent.fg'),
	'editscript.operator.fg': (getToken) => getToken('content.default.fg'),
	'editscript.comment.fg': (getToken) => getToken('content.muted.fg'),
	'editscript.link.fg': (getToken) => getToken('content.info.fg'),
	'editscript.heading.fg': (getToken) => getToken('content.accent.fg'),
	'editscript.bool.fg': (getToken) => getToken('content.accent.fg'),
	'editscript.string.fg': (getToken) => getToken('content.info.fg'),
	'editscript.invalid.fg': (getToken) => getToken('log.error.fg'),
};

const pathDef = [
	[ '$scriptId', '$mode' ],
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
			'theme',
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
		this.module.theme.addTokens(themeTokens);

		this.model = new Model({ data: { roomScript: null, source: '', version: null, boilerplate: null, isModified: false }, eventBus: this.app.eventBus });

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
						return fetchRoomScriptSource(roomScript, () => this.module.auth.refreshTokens())
							.then(source => {
								if (source || params.mode != 'boilerplate') {
									return this._setState({ roomScript, source, version });
								}
								return roomScript.call('getBoilerplate')
									.then(result => this._setState({ roomScript, source, version, boilerplate: result.source }));
							})
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
			version: typeof props.version == 'string' ? props.version : null,
			boilerplate: props.boilerplate || null,
			isModified: this.model.roomScript == props.roomScript ? this.model.isModified : (!props.source && !!props.boilerplate),
			error: props.error || null,
		});
	}

	/**
	 * Sets the script route.
	 * @param {object} params Route params.
	 * @param {string} [params.scriptId] Script ID.
	 * @param {"boilerplate"} [params.mode] Mode to run the script editor in.
	 */
	setRoute(params) {
		this.module.router.setRoute('editscript', {
			scriptId: params?.scriptId || null,
			mode: params?.mode || null,
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
		this.module.theme.removeTokens(themeTokens);
	}
}

export default EditScript;
