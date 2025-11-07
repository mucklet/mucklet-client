import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import apiStates, { getApiState } from 'utils/apiStates';
import ModelCollapser from 'components/ModelCollapser';
import errToL10n from 'utils/errToL10n';
import taskRunDone from 'utils/taskRunDone';

const callRealmMethods = {
	up: {
		error: {
			title: l10n.l('overseerRealmSettings.realmUpFailed', "Realm Up Failed"),
			body: l10n.l('overseerRealmSettings.realmUpFailedBody', "An error occurrent on Realm Up:"),
		},
		success: {
			title: l10n.l('overseerRealmSettings.realmUp', "Realm Up"),
			body: l10n.l('overseerRealmSettings.realmUpFailedBody', "Realm Up completed successfully."),
		},
	},
	down: {
		error: {
			title: l10n.l('overseerRealmSettings.realmDownFailed', "Realm Down Failed"),
			body: l10n.l('overseerRealmSettings.realmDownFailedBody', "An error occurrent on Realm Down:"),
		},
		success: {
			title: l10n.l('overseerRealmSettings.realmDown', "Realm Down"),
			body: l10n.l('overseerRealmSettings.realmDownFailedBody', "Realm Down completed successfully."),
		},
	},
	stop: {
		error: {
			title: l10n.l('overseerRealmSettings.realmStopFailed', "Realm Stop Failed"),
			body: l10n.l('overseerRealmSettings.realmStopFailedBody', "An error occurrent on Realm Stop:"),
		},
		success: {
			title: l10n.l('overseerRealmSettings.realmStop', "Realm Stop"),
			body: l10n.l('overseerRealmSettings.realmStopFailedBody', "Realm Stop completed successfully."),
		},
	},
};

/**
 * OverseerRealmSettingsTopSection draws the overseer edit form top section for a realm.
 */
class RouteRealmSettingsRealms {
	constructor(module, realm) {
		this.module = module;
		this.realm = realm;
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Elem(n => n.elem('div', { className: 'overseerrealmsettings-topsection' }, [

			// Realm state
			n.elem('div', { className: 'common--sectionpadding' }, [
				n.elem('div', { className: 'flex-row' }, [
					// Realm state
					n.component(new ModelComponent(
						this.realm,
						new Elem(n => n.elem('div', { className: 'flex-1' }, [
							n.component('icon', new FAIcon('circle')),
							n.html('&nbsp;&nbsp;'),
							n.component('txt', new Txt('')),
						])),
						(m, c) => {
							let state = getApiState(m);
							c.getNode('txt').setText(state.text);
							let icon = c.getNode('icon');
							for (let s of apiStates) {
								icon[state == s ? 'addClass' : 'removeClass'](s.className);
							}
						},
					)),

					// Realm API version
					n.component(new ModelTxt(
						this.realm,
						m => m.apiVersionName
							? l10n.l('overseerRealmSettings.version', "Version {version}", { version: m.apiVersionName })
							: '',
						{ className: 'overseerrealmsettings-topsection--version flex-auto' },
					)),
				]),
			]),

			// Node realm action buttons
			n.component(new ModelCollapser(this.realm, [{
				condition: m => m.apiType == 'node',
				factory: m => new Elem(n => n.elem('div', { className: 'flex-row m pad16' }, [
					// Realm up
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.realm,
							new Elem(n => n.elem('button', {
								className: 'btn primary small icon-left common--btnwidth',
								events: {
									click: () => this._callRealm('up'),
								},
							}, [
								n.component(new FAIcon('play')),
								n.component(new Txt(l10n.l('overseerRealmSettings.realmUp', "Realm Up"))),
							])),
							(m, c) => {
								let state = getApiState(m);
								c.setProperty('disabled', state.transitional || m.apiTaskRun ? 'disabled' : null);
							},
						)),
					]),

					// Realm stop
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.realm,
							new Elem(n => n.elem('button', {
								className: 'btn secondary small icon-left common--btnwidth',
								events: {
									click: () => this._callRealm('stop'),
								},
							}, [
								n.component(new FAIcon('pause')),
								n.component(new Txt(l10n.l('overseerRealmSettings.realmStop', "Realm Stop"))),
							])),
							(m, c) => {
								let state = getApiState(m);
								c.setProperty('disabled', state.transitional || m.apiTaskRun ? 'disabled' : null);
							},
						)),
					]),

					// Realm down
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.realm,
							new Elem(n => n.elem('button', {
								className: 'btn warning small icon-left common--btnwidth',
								events: {
									click: () => this._callRealm('down'),
								},
							}, [
								n.component(new FAIcon('stop')),
								n.component(new Txt(l10n.l('overseerRealmSettings.realmDown', "Realm Down"))),
							])),
							(m, c) => {
								let state = getApiState(m);
								c.setProperty('disabled', state.transitional || m.apiTaskRun ? 'disabled' : null);
							},
						)),
					]),
				])),
			}])),

			// Manual realm action buttons
			n.component(new ModelCollapser(this.realm, [{
				condition: m => m.apiType == 'manual',
				factory: m => new Elem(n => n.elem('div', { className: 'flex-row m pad16' }, [
					// Set Online
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.realm,
							new Elem(n => n.elem('button', {
								className: 'btn primary small common--btnwidth',
								events: {
									click: () => this._callRealm('set', { apiState: 'online' }),
								},
							}, [
								n.component(new FAIcon('play')),
								n.component(new Txt(l10n.l('overseerRealmSettings.setOnline', "Set Online"))),
							])),
							(m, c) => c.setProperty('disabled', m.apiState == 'online' ? 'disabled' : null),
						)),
					]),

					// Set Offline
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.realm,
							new Elem(n => n.elem('button', {
								className: 'btn warning small common--btnwidth',
								events: {
									click: () => this._callRealm('set', { apiState: 'offline' }),
								},
							}, [
								n.component(new FAIcon('stop')),
								n.component(new Txt(l10n.l('overseerRealmSettings.setOffline', "Set Offline"))),
							])),
							(m, c) => c.setProperty('disabled', m.apiState == 'offline' ? 'disabled' : null),
						)),
					]),
				])),
			}])),

			// API containers
			n.component(new ModelCollapser(this.realm, [{
				condition: m => m.apiContainers,
				factory: m => this.module.nodeContainers.newNodeContainers(m.apiContainers, {
					className: 'overseerrealmsettings-topsection--containers',
				}),
			}])),

			n.elem('div', { className: 'common--hr' }),

		]));

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_callRealm(method, params) {
		this.module.api.call(`control.overseer.realm.${this.realm.id}`, method, params)
			.then((taskRun) => {
				let o = callRealmMethods[method];
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
}

export default RouteRealmSettingsRealms;
