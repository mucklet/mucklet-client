import { Elem, Txt } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import PanelSection from 'components/PanelSection';
import l10n from 'modapp-l10n';

class PageCustomThemeSettings extends PanelSection {
	constructor(module, user, player, state) {
		super(
			l10n.l('pageCustomTheme.customTheme', "Custom theme"),
			new Elem(n => n.elem('button', { events: {
				click: () => module.self.open(),
			}, className: 'btn medium default-400 full-width icon-left' }, [
				n.component(new FAIcon('pencil')),
				n.component(new Txt(l10n.l('pageCustomTheme.editTheme', "Edit theme"))),
			])),
			{
				className: 'common--sectionpadding',
				noToggle: true,
			},
		);
	}
}

export default PageCustomThemeSettings;
