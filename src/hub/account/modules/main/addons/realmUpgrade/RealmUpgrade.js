import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import RealmUpgradeButton from './RealmUpgradeButton';

/**
 * RealmUpgrade provides components to upgrade a realm.
 */
class RealmUpgrade {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'toaster',
			'confirm',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	/**
	 * Creates a RealmUpgradeButton component.
	 * @param {RealmDetailsModel} realm Realm model.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Additional class names for the fader.
	 * @param {string} [opt.buttonClassName] Additional class names for the button.
	 * @param {"medium" | "small" | "large"} [opt.size] Button size. Defaults to "medium".
	 * @returns {Component} RealmUpgradeButton component.
	 */
	newButton(realm, opt) {
		return new RealmUpgradeButton(this.module, realm, opt);
	}

	upgrade(realmId) {
		this.module.api.call(`control.realm.${realmId}.details`, 'upgrade')
			.then(() => this.module.toaster.open({
				title: l10n.l('realmUpgrade.upgradingRealm', "Upgrading realm"),
				content: new Elem(n => n.elem('div', [
					n.component(new Txt(l10n.l('realmUpgrade.upgradingRealmBody1', "Realm is being upgraded."), { tagName: 'p' })),
					n.component(new Txt(l10n.l('realmUpgrade.upgradingRealmBody2', "Everything is most likely going smoothly."), { tagName: 'p' })),
				])),
				closeOn: 'click',
				type: 'success',
				autoclose: true,
			}))
			.catch(err => this.module.confirm.openError(err));
	}

	dispose() {}
}

export default RealmUpgrade;
