import { Elem, Txt, Html } from 'modapp-base-component';
import isComponent from 'utils/isComponent';
import HelpRelatedTopics, { txtRelatedTopics, txtRelatedCommands } from './HelpRelatedTopics';


class HelpCategory {
	constructor(module, categories, category) {
		this.module = module;
		this.categories = categories;
		this.category = category;
		// Clone topics to prevent updates.
		this.topics = category.topics.toArray();
	}

	render(el) {
		let c = this.category;
		let desc = typeof c.desc == 'function' ? c.desc() : c.desc;
		this.elem = new Elem(n => n.elem('div', { className: 'help-category' }, [
			n.component(new Txt(c.title, { tagName: 'h3', className: 'margin-bottom-m' })),
			n.component(isComponent(desc) ? desc : new Html(desc, { className: 'help-category--desc' })),
			n.component(new HelpRelatedTopics([
				{
					title: txtRelatedTopics,
					items: this._getRelatedCategories(),
				},
				{
					title: txtRelatedCommands,
					items: this.category.topics,
				},
			])),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_getRelatedCategories() {
		let c = this.category.categories;
		if (!c || !c.length) return null;

		return c.map(id => this.categories.get(id)).filter(c => c);
	}
}

export default HelpCategory;
