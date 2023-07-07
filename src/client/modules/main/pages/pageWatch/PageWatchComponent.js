import { Elem, Context } from 'modapp-base-component';
import { CollectionList, ModelComponent, CollectionComponent } from 'modapp-resource-component';
import { Model, ModelToCollection } from 'modapp-resource';
import Collapser from 'components/Collapser';
import PageWatchChar from './PageWatchChar';
import PageWatchNoWatch from './PageWatchNoWatch';

class PageWatchComponent {
	constructor(module, state, close) {
		this.module = module;
		state.charId = state.charId || null;
		this.state = state;
		this.close = close;
		this.model = null;
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });
		this.elem = new Elem(n => n.elem('div', { className: 'pagewatch' }, [
			n.component('charlist', new Context(
				() => new ModelToCollection(this.module.charsAwake.getWatches(), {
					compare: (a, b) => {
						let ac = a.value.char;
						let bc = b.value.char;
						return (bc.awake - ac.awake) || (bc.lastAwake - ac.lastAwake) || a.key.localeCompare(b.key);
					},
					eventBus: this.module.self.app.eventBus,
				}),
				col => col.dispose(),
				col => new Elem(n => n.elem('div', [
					n.component(new CollectionList(
						col,
						m => new ModelComponent(
							m.char,
							new PageWatchChar(this.module, m, this.model),
							(m, c, change) => {
								// Refresh sorting of the item
								if (change && (change.hasOwnProperty('awake') || change.hasOwnProperty('lastAwake'))) {
									col.refresh(m.id);
								}
							},
						),
						{ className: 'pagewatch--chars' },
					)),
					n.component(new CollectionComponent(
						col,
						new Collapser(),
						(col, c, ev) => c.setComponent(col.length ? null : new PageWatchNoWatch(this.module)),
					)),
				])),
			)),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, this.model.props);
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default PageWatchComponent;
