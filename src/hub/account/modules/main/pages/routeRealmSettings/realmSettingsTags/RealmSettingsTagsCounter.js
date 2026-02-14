import { Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';

class RealmSettingsTagsCounter extends ModelComponent{
	constructor(module, tags, opt) {
		let countCb = opt?.count || ((m) => Object.keys(m.props).length);

		let txt = new Txt('', {
			tagName: 'div',
			className: 'realmsettingstags-counter' + (opt?.className ? ' ' + opt.className : ''),
			duration: 0,
		});
		let update = () => {
			let max = module.hubInfo.getControl().maxRealmTags;
			let count = countCb(tags);
			txt.setText(l10n.l('realmSettingsTags.countOfMax', "{count}/{max}", {
				count,
				max: max || '?',
			}));
			txt[max && count > max ? 'addClass' : 'removeClass']('exceeded');
			txt[max && count == max ? 'addClass' : 'removeClass']('maxed');
			opt?.onUpdate?.();
		};
		super(
			module.hubInfo.getControl(),
			new ModelComponent(
				tags,
				txt,
				(m, c, change) => update(),
			),
			() => update(),
		);
	}
}

export default RealmSettingsTagsCounter;
