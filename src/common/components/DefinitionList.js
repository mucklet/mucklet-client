import { Elem, Txt, Fragment } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import FAIcon from './FAIcon';
import './definitionList.scss';

/**
 * DefinitionList is component that displays the definition list of a
 * project, such as a node or a realm.
 */
class DefinitionList extends CollectionList {

	/**
	 * Creates an instance of DefinitionList
	 * @param {Collection<{ title: LocaleString|string, component: Component }>} collection Collection or array of definitions.
	 * @param {object} [opt] Optional parameters.
	 */
	constructor(collection, opt) {
		super(
			collection,
			(item) => new Fragment([
				new Txt(item?.title, { tagName: 'dt' }),
				new Elem(n => n.elem('dd', [
					n.component(typeof item?.icon == 'string'
						? new FAIcon(item.icon)
						: item?.icon || null,
					),
					n.component(item?.component),
				])),
			]),
			{
				...opt,
				className: 'definitionlist' + (opt?.className ? ' ' + opt.className : ''),
				tagName: 'dl',
				horizontal: true,
			},
		);
		super.setCollection(collection);
	}
}

export default DefinitionList;
