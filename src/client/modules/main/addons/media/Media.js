import { Model } from 'modapp-resource';

const defaultQueries = {
	canHover: '(hover: hover)',
	pointerCoarse: '(pointer: coarse)',
};

/**
 * Media provides a model with css media information using media queries.
 */
class Media {

	constructor(app, params) {
		this.app = app;

		this.params = params;

		this._init();
	}

	_init() {
		this.queries = {};
		let data = {};
		for (let k in defaultQueries) {
			data[k] = this._addQuery(k, defaultQueries[k]);
		}

		this.model = new Model({ data, eventBus: this.app.eventBus });
	}

	getModel() {
		return this.model;
	}

	_onQueryChange(k, e) {
		this.model.set({ [k]: e.matches });
	}

	_addQuery(k, query) {
		let mql = window.matchMedia(query);
		let cb = this._onQueryChange.bind(this, k);
		mql.addEventListener('change', cb);
		this.queries[k] = { mql, cb };
		return mql.matches;
	}

	_removeQuery(k) {
		let o = this.queries[k];
		o.mql.removeEventListener('change', o.cb);
		deleted(this.queries[k]);
	}

	dispose() {
		for (let k in this.queries) {
			this._removeQuery(k);
		}
	}
}

export default Media;
