import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import ModelFader from 'components/ModelFader';
import l10n from 'modapp-l10n';

class RealmUpgradeButton {

	/**
	 * Creates an instance of RealmUpgradeButton
	 * @param {object} module Module object.
	 * @param {RealmDetailsModel} realm Realm model.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Additional class names for the fader.
	 * @param {string} [opt.buttonClassName] Additional class names for the button.
	 * @param {"medium" | "small" | "large"} [opt.size] Button size. Defaults to "medium".
	 */
	constructor(module, realm, opt) {
		this.module = module;
		this.realm = realm;
		this.opt = opt;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.realm,
			new ModelComponent(
				null,
				new ModelFader(null, [{
					condition: next => !!next,
					factory: next => new Elem(n => n.elem('button', {
						className: 'btn primary ' + (this.opt?.size || 'medium') + ' icon-left common--btnwidth' + (this.opt?.buttonClassName ? ' ' + this.opt.buttonClassName : ''),
						events: {
							click: (c, ev) => {
								ev.stopPropagation();
								this.module.self.upgrade(this.realm.id);
							},
						},
					}, [
						n.component(new FAIcon('arrow-circle-up')),
						n.component(new ModelTxt(next, m => l10n.l('realmUpgrade.upgradeVersion', "Upgrade v{version}", { version: m.name }))),
					])),
				}], {
					 className: this.opt?.className,
				}),
				(m, c) => c.setModel(m?.next),
			),
			(m, c) => c.setModel(m?.release),
		);

		return this.elem.render(el);
	}

	unrender() {
		this.elem?.unrender();
		this.elem = null;
	}
}

export default RealmUpgradeButton;
