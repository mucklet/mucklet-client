import { Elem, Input } from 'modapp-base-component';
import l10n from 'modapp-l10n';

/**
 * SearchBarComponent draws the sign in button.
 */
class SearchBarComponent {
	constructor(module, model, filter) {
		this.module = module;
		this.model = model;
		this.filter = filter;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'searchbar' }, [
			n.elem('button', {
				className: 'searchbar--btn btn',
				events: {
					click: (c, e) => {
						this._search();
						e.preventDefault();
					},
				},
			}, [
				n.elem('i', { className: 'fa fa-search' }),
			]),
			n.component(new Input(this.model.input, {
				className: 'searchbar--input',
				attributes: {
					placeholder: l10n.t('searchBar.inputPlaceholder', "Enter a name or genre"),
				},
				events: {
					input: c => this.model.set({ input: c.getProperty('value') }),
					keydown: (c, e) => {
						if (e.key == 'Enter') {
							e.preventDefault();
							e.stopPropagation();
							this._search();
						}
					},
				},
			})),
		]));
		return this.elem.render(el);
	}

	unrender() {
		this.elem?.unrender();
		this.elem = null;
	}

	_search() {
		this.filter.setFilter(this.model.input);

		this.module.realmList.getRealmsPromise().then(realms => {
			this.module.realmList.setRealms(realms.toArray().filter(realm => this.filter.match(realm)));
		});
	}
}

export default SearchBarComponent;
