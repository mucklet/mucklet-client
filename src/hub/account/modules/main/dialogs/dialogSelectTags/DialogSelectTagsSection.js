import { Context } from 'modapp-base-component';
import { CollectionComponent, ModelTxt, CollectionList } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import DialogSelectTagsTag from './DialogSelectTagsTag';


class DialogSelectTagsSection {
	constructor(module, tags, type, model) {
		this.module = module;
		this.tags = tags;
		this.type = type;
		this.model = model;
	}

	render(el) {
		this.elem = new Context(
			() => new CollectionWrapper(this.tags, {
				filter: t => t.type == this.type.key,
			}),
			tags => tags.dispose(),
			tags => new CollectionComponent(
				tags,
				new Collapser(),
				(col, c, ev) => c.setComponent(col.length
					? c.getComponent() || new PanelSection(
						new ModelTxt(this.type, m => m.text, { className: 'dialogselecttags-section--title', tagName: 'h3' }),
						new CollectionList(col, tag => new DialogSelectTagsTag(this.model, tag)),
						{
							className: 'dialogselecttags-section pad-bottom-s' + this.className,
						},
					)
					: null,
				),
			),
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_isType(tag) {
		return tag.type == this.type.key;
	}
}

export default DialogSelectTagsSection;
