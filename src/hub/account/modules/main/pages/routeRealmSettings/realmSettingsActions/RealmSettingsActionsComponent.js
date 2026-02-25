import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';
import { getProjectState } from 'utils/projectStates';
import ModelCollapser from 'components/ModelCollapser';
import errToL10n from 'utils/errToL10n';
import taskRunDone from 'utils/taskRunDone';

const callRealmMethods = {
	// apply: {
	// 	error: {
	// 		title: l10n.l('realmSettingsActions.applyChangesFailed', "Apply Changes Failed"),
	// 		body: l10n.l('realmSettingsActions.applyChangesFailedBody', "An error occurrent when applying realm changes:"),
	// 	},
	// 	success: {
	// 		title: l10n.l('realmSettingsActions.changesApplied', "Changes Applied"),
	// 		body: l10n.l('realmSettingsActions.changesAppliedBody', "Realm changes applied successfully."),
	// 	},
	// },
	restart: {
		error: {
			title: l10n.l('realmSettingsActions.realmRestartFailed', "Realm Restart Failed"),
			body: l10n.l('realmSettingsActions.realmRestartFailedBody', "An error occurrent on realm restart:"),
		},
		success: {
			title: l10n.l('realmSettingsActions.realmRestarted', "Realm Restarted"),
			body: l10n.l('realmSettingsActions.realmRestartedBody', "Realm restarted successfully."),
		},
	},
};

/**
 * RealmSettingsActionsComponent draws the actions for a realm.
 */
class RealmSettingsActionsComponent {
	constructor(module, realm) {
		this.module = module;
		this.realm = realm;
	}

	render(el) {

		this.elem = new ModelCollapser(this.realm, [{
			condition: m => m.type == 'node',
			factory: m => new Elem(n => n.elem('div', { className: 'realmsettingsactions common--sectionpadding' }, [
				n.elem('div', { className: 'flex-row m pad16' }, [
					// Realm restart
					n.elem('div', { className: 'flex-auto' }, [
						n.component(new ModelComponent(
							this.realm,
							new Elem(n => n.elem('button', {
								className: 'btn warning small icon-left common--btnwidth',
								events: {
									click: (c, ev) => {
										ev.stopPropagation();
										this.module.confirm.open(() => this._callRealm('serviceRestart'), {
											title: l10n.l('realmSettingsActions.confirmRestart', "Confirm restart"),
											body: new Elem(n => n.elem('div', [
												n.component(new Txt(l10n.l('realmSettingsActions.restartRealmBody', "Do you really wish to restart the realm service?"), { tagName: 'p' })),
												n.elem('p', { className: 'dialog--error' }, [
													n.component(new FAIcon('exclamation-triangle')),
													n.html("&nbsp;&nbsp;"),
													n.component(new Txt(l10n.l('realmSettingsActions.restartWarning', "Restart may cause player disruption, but no data will be lost."))),
												]),
											])),
											confirm: l10n.l('realmSettingsActions.restart', "Restart"),
										});
									},
								},
							}, [
								n.component(new FAIcon('refresh')),
								n.component(new Txt(l10n.l('realmSettingsActions.restart', "Restart"))),
							])),
							(m, c) => {
								let state = getProjectState(m);
								c.setProperty('disabled', state.transitional || m.taskRun ? 'disabled' : null);
							},
						)),
					]),

					// Upgrade button
					n.elem('div', { className: 'flex-auto' }, [
						// Realm upgrade
						n.component(this.module.realmUpgrade.newButton(this.realm, {
							size: 'small',
							buttonClassName: 'common--btnwidth',
						})),
					]),
				]),
			])),
		}]);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_callRealm(method, params) {
		this.module.api.call(`control.realm.${this.realm.id}.details`, method, params)
			.then((taskRun) => {
				let o = callRealmMethods[method];
				// Only give toaster feedback for update and restart calls.
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

export default RealmSettingsActionsComponent;
