import { Collection } from 'modapp-resource';
import { CollectionList } from 'modapp-resource-component';
import CharLogMutedEvent from './CharLogMutedEvent';


class CharLogMuted {
	constructor(module, char, ctx, list) {
		this.module = module;
		this.char = char;
		this.ctx = ctx;
		this._collection = new Collection({ data: list, idAttribute: null, eventBus: this.module.self.app.eventBus });
	}

	get length() {
		return this._collection.length;
	}

	addEvent(ev, idx) {
		return this._collection.add(ev, idx);
	}

	render(el) {
		this.elem = new CollectionList(this._collection, ev => new CharLogMutedEvent(this.module, this.char, this.ctx, ev), {
			horizontal: true,
			className: 'charlog-muted',
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

export default CharLogMuted;
