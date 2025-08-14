import { Txt, RootElem } from 'modapp-base-component';
import Collapser from './Collapser';
import './pageHeader.scss';


/**
 * A component for generating a display name as a flexbox.
 */
class PageHeader extends RootElem {

	/**
	 * Creates an instance of PageHeader
	 * @param {LocaleString | string} title  Title text.
	 * @param {LocaleString | string} [subtitle] Subtitle text.
	 * @param {RootElemOptions} opt Optional params.
	 */
	constructor(title, subtitle, opt) {
		const titleTxt = new Txt('', { tagName: 'h2', className: 'pageheader--title' });
		const subtitleTxt = new Txt('', { className: 'pageheader--title' });
		const subtitleCollapser = new Collapser(null);
		super('div', opt, [
			{ component: titleTxt },
			{ component: subtitleCollapser },
		]);

		this.titleTxt = titleTxt;
		this.subtitleTxt = subtitleTxt;
		this.subtitleCollapser = subtitleCollapser;

		this.setTitle(title, subtitle);
	}

	/**
	 * Sets the title and optionally the subtitle.
	 * @param {LocaleString | string} title  Title text.
	 * @param {LocaleString | string} [subtitle] Subtitle text.
	 * @returns {this}
	 */
	setTitle(title, subtitle) {
		this.titleTxt.setText(title);
		if (typeof subtitle != 'undefined') {
			this.setSubtitle(subtitle);
		}
		return this;
	}

	/**
	 * Sets the subtitle.
	 * @param {LocaleString | string} subtitle Subtitle text.
	 * @returns {this}
	 */
	setSubtitle(subtitle) {
		this.subtitleTxt.setText(subtitle);
		this.subtitleCollapser.setComponent(this.subtitleTxt.getText()
			? this.subtitleTxt
			: null,
		);
		return this;
	}
}

export default PageHeader;
