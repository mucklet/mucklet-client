import { RootElem } from 'modapp-base-component';
import autocompleter from 'autocompleter';
import './autocomplete.scss';

/**
 * AutoComplete is a wrapper around https://github.com/kraaden/autocomplete.
 *
 * The options may contain any option from {@link https://github.com/jirenius/modapp-base-component/blob/master/src/RootElem.js|RootElem}
 * and options of {@link https://github.com/kraaden/autocomplete|autocomplete}.
 * @param {object} [opt] Options.
 * @param {object} [opt.innerClassName] Class names for the autocomplete dropdown.
 */
class AutoComplete extends RootElem {

	constructor(value, opt) {
		if (typeof value == 'object' && value !== null) {
			opt = value;
			value = "";
		}
		opt = Object.assign({ attributes: null, properties: null }, opt);
		opt.attributes = Object.assign({ type: 'text', autocomplete: 'off' }, opt.attributes, { value });
		opt.properties = Object.assign({}, opt.properties, { value });
		super('input', opt);
		let onSelect = opt.onSelect;
		if (onSelect) {
			opt.onSelect = (item) => {
				onSelect(this, item);
			};
		}
		let fetch = opt.fetch;
		if (fetch) {
			opt.fetch = (text, update) => {
				fetch(text, update, this);
			};
		}

		this._onCustomize = this._onCustomize.bind(this);
		this._onMutation = this._onMutation.bind(this);
		this.opt = opt;
		this.auto = null;
		this.selecting = false;
	}

	render(el) {
		let rel = super.render(el);
		this.auto = autocompleter(Object.assign({}, this.opt, { input: rel, className: this.opt.innerClassName, customize: this._onCustomize }));
		this.observer = MutationObserver && new MutationObserver(this._onMutation);
		this.observer.observe(document.body, { childList: true, subtree: false });
		return rel;
	}

	unrender() {
		if (this.auto) {
			this.auto.destroy();
			this.auto = null;
			if (this.observer) {
				this.observer.disconnect();
				this.observer = null;
			}
			this.selecting = false;
			this.container = null;
		}
		super.unrender();
	}

	isSelecting() {
		return this.selecting;
	}

	_onCustomize(input, inputRect, container) {
		this.selecting = true;
		this.container = container;
	}

	_onMutation() {
		this.selecting = this.container && this.container.parentNode == document.body;
		if (!this.selecting) {
			this.container = null;
		}
	}
}

export default AutoComplete;
