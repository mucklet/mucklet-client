import { Html } from 'modapp-base-component';

/**
 * PoliciesBody renders the policies body.
 */
class PoliciesBody extends Html{
	constructor(module, html) {
		super(html, { className: 'policies-body' });
		this.module = module;

		// Set policy link bindings
		this._policies = this.module.self.availablePolicies.map(p => ({
			slug: p,
			onClick: this._onClick.bind(this, p),
			links: null,
		}));
	}

	render(el) {
		let rel = super.render(el);

		for (let p of this._policies) {
			p.links = [];
			let links = rel.getElementsByClassName(p.slug);
			for (let l of links) {
				l.setAttribute('href', 'javascript:;');
				l.addEventListener('click', p.onClick);
				p.links.push(l);
			}
		}
		return rel;
	}

	unrender() {
		for (let p of this._policies) {
			if (p.links) {
				for (let l of p.links) {
					l.removeEventListener('click', p.onClick);
				}
				p.links = null;
			}
		}
		super.unrender();
	}

	_onClick(policy, ev) {
		this.module.self.openPolicy(policy);
		ev.preventDefault();
	}
}

export default PoliciesBody;
