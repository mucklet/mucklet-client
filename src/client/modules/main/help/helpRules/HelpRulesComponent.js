import FormatTxt from 'components/FormatTxt';
import l10n from 'modapp-l10n';

class HelpRulesComponent extends FormatTxt{
	constructor(module) {
		super(module.info.getCore().rules || l10n.t('helpRules.placeholderRules', "Be **nice** and **respectful** to one another."), { className: 'helpabout formattxt-charlog', noInteraction: true });
	}
}

export default HelpRulesComponent;
