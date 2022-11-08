import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import LabelToggleBox from 'components/LabelToggleBox';
import ScreenDialog from 'components/ScreenDialog';

/**
 * LoginAgreeTerms draws the agree terms window
 */
class LoginAgreeTerms {
	constructor(module, state) {
		this.module = module;
		this.state = state;
		state.agreeTerms = state.agreeTerms || this._defaultState();
	}

	render(el) {
		this.model = new Model({ data: this.state.agreeTerms, eventBus: this.module.self.app.eventBus });

		this.elem = new ScreenDialog(new Elem(n => n.elem('div', { className: 'login-agreeterms' }, [
			n.component(new Txt(l10n.l('login.agreeTermsAgeDisclaimer', "You must be at least 18 years old to continue."), { tagName: 'div', className: 'login-agreeterms--disclaimer' })),
			n.component(new Txt(l10n.l('login.agreeTermsBody', "To use this service, you must read and agree to the policies and terms."), { tagName: 'p', className: 'login-agreeterms--body' })),
			n.component(new LabelToggleBox(
				new Elem(n => n.elem('div', { className: 'login-agreeterms--agree' }, [
					n.component(new Txt(l10n.l('login.agreePrefix', "I agree to the "))),
					n.component(new Txt(l10n.l('login.privacyPolicy', "privacy policy"), {
						tagName: 'a',
						className: 'link',
						attributes: {
							href: 'javascript:;',
						},
						events: {
							click: (c, ev) => {
								this.module.policies.openPolicy('privacy');
								ev.preventDefault();
							},
						},
					})),
					n.component(new Txt(l10n.l('login.agreeMid', " and "))),
					n.component(new Txt(l10n.l('login.terms', "terms"), {
						tagName: 'a',
						className: 'link',
						attributes: {
							href: 'javascript:;',
						},
						events: {
							click: (c, ev) => {
								this.module.policies.openPolicy('terms');
								ev.preventDefault();
							},
						},
					})),
					n.component(new Txt(l10n.l('login.agreeSuffix', "."))),
				])),
				this.model.agree,
				{
					className: 'common--formmargin ',
					onChange: v => this.model.set({ agree: v }),
				},
			)),
			n.component('message', new Collapser(null)),
			n.component('submit', new ModelComponent(
				this.model,
				new Elem(n => n.elem('button', {
					events: { click: () => this._onContinue(this.model) },
					className: 'btn large primary login--login pad-top-xl login--btn',
				}, [
					n.elem('spinner', 'div', { className: 'spinner fade hide' }),
					n.component(new Txt(l10n.l('login.continue', "Continue"))),
				])),
				(m, c) => c.setProperty('disabled', m.agree ? null : 'disabled'),
			)),
		])), {
			title: l10n.l('login.agreeToTerms', "Agree to Terms"),
			close: () => {
				this._clearState();
				this.module.self.logout();
			},
		});
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.state.agreeTerms = this.model.toJSON();
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_defaultState() {
		return { agree: false };
	}

	_clearState() {
		let o = this._defaultState();
		this.state.agreeTerms = o;
		if (this.model) {
			this.model.set(o);
		}
	}

	_onContinue(model) {
		if (this.agreeTermsPromise) return;

		if (!model.agree) {
			this._setMessage(l10n.l('login.youMustAgree', "You shouldn't try to bypass this."));
			return;
		}

		if (this.elem) {
			this.elem.getComponent().getNode('submit').getComponent().getNode('spinner').classList.remove('hide');
		}

		this.agreeTermsPromise = this.module.self.agreeToTerms()
			.then(user => {
				this._clearState();
				return user;
			})
			.catch(err => {
				this._setMessage(l10n.l(err.code, err.message, err.data));
				this.agreeTermsPromise = null;
				if (this.elem) {
					this.elem.getComponent().getNode('submit').getComponent().getNode('spinner').classList.add('hide');
				}
			});
	}

	_setMessage(msg) {
		if (!this.elem) return;
		let n = this.elem.getComponent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'login--message' }) : null);
	}
}

export default LoginAgreeTerms;
