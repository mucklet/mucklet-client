import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import reload from 'utils/reload';

function versionCompare(a, b) {
	if (!a || !b) {
		return { diff: null, level: null };
	}

	let ap = a.split('.');
	let bp = b.split('.');

	let level = 0;
	let diff = 0;
	while (level < 4) {
		let av = ap[level];
		let bv = bp[level];
		if (!av || !bv) {
			if (av || bv) {
				diff = av ? 1 : -1;
			}
			break;
		}

		diff = ap[level].localeCompare(bp[level], 'en', { sensitivity: 'base', numeric: true });
		if (diff) break;
		level++;
	}

	// Before 1.0.0, a "minor" update will be considered "major".
	if (level > 0 && ap[0] === "0") {
		level--;
	}

	return { diff, level };
}

/**
 * Version compares client and API version to ensure they match.
 */
class Version {

	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onInfoChange = this._onInfoChange.bind(this);

		this.app.require([
			'info',
			'confirm',
			'toaster',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.latestVersion = APP_VERSION;
		this.clientInfo = this.module.info.getClient();
		this.coreInfo = this.module.info.getCore();

		this._listen(true);
	}

	_listen(on) {
		let cb = on ? 'on' : 'off';
		this.clientInfo[cb]('change', this._onInfoChange);
		this.coreInfo[cb]('change', this._onInfoChange);
	}

	_onInfoChange(change) {
		if (this.clientInfo.version == this.latestVersion || this.clientInfo.version == APP_VERSION || (change && !change.hasOwnProperty('version'))) {
			return;
		}

		let apiVer = this.coreInfo.version;
		let clientVer = this.clientInfo.version;

		if (!apiVer || !clientVer) {
			return;
		}

		let { diff, level } = versionCompare(APP_VERSION, clientVer);
		if (!diff) {
			return;
		}

		// Check if client version works under api version.
		// Client minor version must be same or lower, but patch level may be greater.
		let o = versionCompare(apiVer, clientVer);
		if (o.diff && o.diff < 0 && o.level < 2) {
			return;
		}

		// Store latestVersion we've shown for the user
		this.latestVersion = clientVer;

		if (level == 0) {
			this._confirm(
				l10n.l('version.majorUpdate', "Major update"),
				l10n.l('version.majorUpdateBody2', "It is recommended that you update your client for things to continue to work properly."),
			);
			return;
		}

		if (level == 1) {
			this._confirm(
				l10n.l('version.minorUpdate', "Minor update"),
				l10n.l('version.minorUpdateBody2', "You may continue playing. But updating your client can give you access to new features."),
			);
			return;
		}

		if (level >= 2) {
			this._confirm(
				l10n.l('version.patchUpdate', "Patch update"),
				l10n.l('version.patchUpdateBody2', "You may continue playing. But if you have experienced some issues, updating your client may solve them."),
			);
			return;
		}

	}

	_confirm(title, desc) {
		this.module.toaster.open({
			title,
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('version.gameIsUpdated', "The game has been updated."), { tagName: 'p' })),
				n.component(new Txt(desc, { tagName: 'p' })),
				n.elem('div', { className: 'flex-row margin8' }, [
					n.elem('button', {
						className: 'btn primary',
						events: { click: () => {
							// If the serviceWorker module exists, we use that
							// one to clear the cache and reload. Otherwise we
							// try to reload and clear the cache with a simple
							// fetch.
							let serviceWorker = this.app.getModule('serviceWorker');
							if (serviceWorker) {
								serviceWorker.clearCacheAndReload(true).catch(err => {
									this.module.confirm.open(() => reload(true), {
										title: l10n.l('version.error', "An error occurred"),
										confirm: l10n.l('version.ok', "Okay"),
										body: typeof err == 'string' ? err : err?.message || JSON.stringify(err),
										cancel: null,
									});
								});
							} else {
								reload(true);
							}
						} },
					}, [
						n.component(new Txt(l10n.l('version.update', "Update"))),

					]),
					n.elem('button', {
						className: 'btn secondary',
						events: { click: close },
					}, [
						n.component(new Txt(l10n.l('version.later', "Later"))),
					]),
				]),
			])),
			closeOn: 'button',
		});
	}

	dispose() {
		this._listen(false);
		this.coreInfo = null;
		this.clientInfo = null;
	}
}

export default Version;
