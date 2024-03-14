import FormatTxt from 'components/FormatTxt';
import l10n from 'modapp-l10n';

class HelpAboutComponent extends FormatTxt{
	constructor(module) {
		super(module.info.getCore().about || l10n.t('helpAbout.placeholderInfo', "This is a new realm yet to be described."), { className: 'helpabout formattxt-charlog', noInteraction: true });
	}
}

export default HelpAboutComponent;
