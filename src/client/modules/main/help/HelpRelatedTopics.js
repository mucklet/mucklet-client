import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';
import formatText from 'utils/formatText';

export const txtRelatedTopics = l10n.l('help.relatedHelpTopics', "Related help topics");
export const txtRelatedCommands = l10n.l('help.relatedCommands', "Related commands");

function createTable(col) {
	let list = [];
	for (let m of col) {
		list.push('<tr><td><code class="common--nowrap">help ' + escapeHtml(m.cmd) + '</code></td><td class="common--formattext">' + formatText(l10n.t(m.shortDesc || m.title || '')) + '</td></tr>');
	}
	return list.join('');
};

class HelpRelatedTopics {
	/**
	 * Initializes a new HelpRelatedTopics component.
	 * @param {Array<{title: string|LocaleString, items: Array<{cmd: string, shortDesc?:string, title?:string}>}>} categories A set of categories.
	 */
	constructor(categories) {
		this.categories = (categories || []).filter(c => c.items?.length);
	}
	render(el) {
		// Render nothing if we have no categories with items
		if (!this.categories.length) return;

		this.elem = new Elem(n => {
			return n.elem('div', { className: 'help-relatedtopic' }, this.categories.map(c => n.elem('div', [
				n.component(new Txt(c.title, { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html(createTable(c.items), { tagName: 'tbody' })),
					]),
				]),
			])));
		});
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default HelpRelatedTopics;
