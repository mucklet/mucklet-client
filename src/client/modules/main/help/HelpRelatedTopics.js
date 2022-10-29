import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

function createTable(col) {
	let list = [];
	for (let m of col) {
		list.push('<tr><td><code class="common--nowrap">help ' + escapeHtml(m.cmd) + '</code></td><td>' + escapeHtml(l10n.t(m.shortDesc || m.title || '')) + '</td></tr>');
	}
	return list.join('');
};

class HelpRelatedTopics {
	constructor(categories, topics) {
		this.categories = categories && categories.length ? categories : null;
		this.topics = topics && topics.length ? topics : null;
	}

	render(el) {
		// Render nothing if we have no categories or topics
		if (!this.categories && !this.topics) return;

		this.elem = new Elem(n => n.elem('div', { className: 'help-relatedtopic' }, [
			n.component(this.categories ? new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('help.relatedHelpTopics', "Related help topics"), { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html(createTable(this.categories), { tagName: 'tbody' }))
					])
				])
			])) : null),
			n.component(this.topics ? new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('help.relatedCommands', "Related commands"), { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html(createTable(this.topics), { tagName: 'tbody' }))
					])
				])
			])) : null)
		]));
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
