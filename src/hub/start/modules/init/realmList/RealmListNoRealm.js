import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import Img from 'components/Img';

let tipCount = 0;

const txtTips = [
	l10n.l('realmList.noRealmsTipComma', "Tip: Multiple required genres and themes can be separated with commas (eg. <code>furry, social</code>)"),
	l10n.l('realmList.noRealmsTipNegative', "Tip: Exclude a genre or theme by prefixing it with an exclamation mark (eg. <code>!nsfw</code>)."),
	l10n.l('realmList.noRealmsTipAlternatives', "Tip: Multiple alternatives may be separated with the pipe character (eg. <code>fantasy|medival</code>)."),
];

/**
 * RealmListComponent draws the list of realms.
 */
class RealmListComponent {
	constructor() {}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'realmlist-norealm' }, [
			n.elem('div', { className: 'realmlist-norealm--cont' }, [
				n.component(new Img('img/search-no-results.svg', { className: 'realmlist-norealm--img' })),
				n.elem('div', { className: 'realmlist-norealm--info' }, [
					n.component(new Txt(l10n.l('realmList.noRealmsInfo', "No matching realm. Try again with some other genre or theme."), { tagName: 'p' })),
					n.component(new Html(txtTips[tipCount++ % txtTips.length], { tagName: 'p', className: 'realmlist-norealm--tip' })),
				]),
			]),
		]));
		return this.elem.render(el);
	}

	unrender() {
		this.elem?.unrender();
		this.elem = null;
	}
}

export default RealmListComponent;
