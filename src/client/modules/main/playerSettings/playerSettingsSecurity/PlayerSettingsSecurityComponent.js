import { Elem, Txt } from 'modapp-base-component';
import ModelCollapser from 'components/ModelCollapser';
import FAIcon from 'components/FAIcon';
import PanelSection from 'components/PanelSection';
import l10n from 'modapp-l10n';

class PlayerSettingsSecurityComponent extends ModelCollapser {
	constructor(module, identity) {
		super(identity, [
			{
				factory: m => new PanelSection(
					l10n.l('playerSettingsSecurity.security', "Security"),
					new Elem(n => n.elem('button', { events: {
						click: () => module.dialogChangePassword.open(m.id),
					}, className: 'btn medium light full-width icon-left' }, [
						n.component(new FAIcon('key')),
						n.component(new Txt(l10n.l('playerSettingsSecurity.changePassword', "Change password"))),
					])),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				),
				condition: m => m.hasLogin,
			},
		]);
	}
}

export default PlayerSettingsSecurityComponent;
