import { RootElem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import * as txtProduct from 'utils/txtProduct';

class HelpSupporterComponent extends RootElem {
	constructor(module) {
		let features = txtProduct.features('supporter');

		super(n => n.elem('div', { className: 'helpsupporter' }, [
			n.elem('section', { className: 'charlog--pad' }, [
				n.component(new Txt(l10n.t('helpSupporter.helpInfo', "Thank you for financially supporting the development, operations, and marketing of the game! And apart from earning our gratitude, it also comes with a few benefits."))),
			]),
			n.elem('section', features.map(o => n.elem('div', { className: 'charlog--pad' }, [
				n.component(new Txt(l10n.t(o.title), { tagName: 'h4' })),
				n.component(new Txt(l10n.t(o.longDesc), { tagName: 'div', className: 'charlog--font-small' })),
			]))),
		]));
	}
}

export default HelpSupporterComponent;
