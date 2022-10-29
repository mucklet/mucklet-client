import { Html } from 'modapp-base-component';

/**
 * PoliciesBody renders the policies body.
 */
class PoliciesBody extends Html{
	constructor(module, html) {
		super(html, { className: 'policies-body' });
		this.module = module;

		// Bind callbacks
		this._onPrivacyClick = this._onClick.bind(this, 'privacy');
		this._onTermsClick = this._onClick.bind(this, 'terms');
	}

	render(el) {
		let rel = super.render(el);
		this._privacyLinks = [];

		let privacyEl = rel.getElementsByClassName('privacy');
		for (let pel of privacyEl) {
			pel.setAttribute('href', 'javascript:;');
			pel.addEventListener('click', this._onPrivacyClick);
			this._privacyLinks.push(pel);
		}
		let termsEl = rel.getElementsByClassName('terms');
		for (let pel of termsEl) {
			pel.setAttribute('href', 'javascript:;');
			pel.addEventListener('click', this._onTermsClick);
			this._termsLinks.push(pel);
		}
		return rel;
	}

	unrender() {
		if (this._privacyLinks) {
			for (let pel of this._privacyLinks) {
				pel.removeEventListener('click', this._onPrivacyClick);
			}
			this._privacyLinks;
		}
		if (this._termsLinks) {
			for (let pel of this._termsLinks) {
				pel.removeEventListener('click', this._onTermsClick);
			}
			this._termsLinks;
		}
		super.unrender();
	}

	_onClick(policy, ev) {
		this.module.self.openPolicy(policy);
		ev.preventDefault();
	}
}

export default PoliciesBody;
