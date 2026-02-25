import { Elem } from 'modapp-base-component';
import RealmListPlaceholder from './RealmListPlaceholder';

/**
 * RealmListPlaceholderList draws three placeholders.
 */
class RealmListPlaceholderList extends Elem {
	constructor() {
		super(n => n.elem(
			'div',
			{
				className: 'realmlist-placeholderlist',
			},
			[ ...new Array(3) ].map(() => n.elem('div', { className: 'realmlist-placeholderlist--realm' }, [
				n.component(new RealmListPlaceholder()),
			])),
		));
	}
}

export default RealmListPlaceholderList;
