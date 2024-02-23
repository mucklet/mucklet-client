import { Html } from 'modapp-base-component';
import ImgModal from 'classes/ImgModal';


class GreetingScreenComponent {

	constructor(module, html) {
		this.module = module;
		this.html = html;
	}

	render(el) {
		this.elem = new Html(this.html);
		let rel = this.elem.render(el);

		this.listeners = [];

		// Convert imgmodal links
		let imgLinks = document.getElementsByClassName('greetingscreen-imgmodal');
		for (let l of imgLinks) {
			let href = l.getAttribute('href');
			let mobileHref = l.dataset.mobileHref;
			delete l.dataset.mobileHref;
			l.setAttribute('href', 'javascript:;');
			let cb = (ev) => this._onClickImg(href, mobileHref || href, ev);
			this.listeners.push(l.removeEventListener('click', cb));
			l.addEventListener('click', cb);
		}

		// Convert login links
		let loginLinks = document.getElementsByClassName('greetingscreen-login');
		for (let l of loginLinks) {
			l.setAttribute('href', 'javascript:;');
			let cb = (ev) => {
				ev.preventDefault();
				this.module.auth.redirectToLogin(true);
			};
			this.listeners.push(l.removeEventListener('click', cb));
			l.addEventListener('click', cb);
		}
		return rel;
	}

	unrender() {
		if (this.elem) {
			// Remove listeners
			for (let f of this.listeners) {
				f();
			}
			this.listeners = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onClickImg(url, urlMobile, ev) {
		ev.preventDefault();

		if (urlMobile && window.matchMedia('screen and (max-width: 720px)').matches) {
			url = urlMobile;
		}
		new ImgModal(url).open();
	}
}

export default GreetingScreenComponent;
