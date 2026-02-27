/**
 * Promo stores any promo code found in the URL to localStorage.
 */
class Promo {

	constructor(app, params) {
		this.app = app;

		this._init();
	}

	_init() {
		let search = window?.location?.search || '';
		let query = URLSearchParams ? new URLSearchParams(search) : null;
		this.promo = query?.get('p');
		if (typeof p == 'string') {
			// Store away and overwrite any previous promo code.
			if (p && localStorage) {
				localStorage.setItem('promo', p);
			}

			// Rewrite URL by removing `p` without reloading page.
			if (window.history?.replaceState) {
				query.delete('p');
				let q = query.toString();
				let url = window.location.pathname + (q ? '?' + q : '') + window.location.hash;
				window.history.replaceState(window.history.state, document.title, url);
			}
		}
	}

	getPromo() {
		return localStorage?.getItem('promo') || this.promo || '';
	}

	dispose() {}
}

export default Promo;
