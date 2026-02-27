import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import ModelFader from 'components/ModelFader';
import SignInMenu from './SignInMenu';

/**
 * SignInComponent draws the sign in button.
 */
class SignInComponent {
	constructor(module, model) {
		this.module = module;
		this.model = model;

		// Bind callbacks
		this._closeMenu = this._closeMenu.bind(this);
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: m => m.user,
				factory: m => new Elem(n => n.elem('div', { className: 'signin' }, [
					// n.elem('button', { className: 'signin--helpbtn signin--headerbtn iconbtn' }, [
					// 	n.component(new FAIcon('question')),
					// ]),
					n.elem('menubtn', 'button', {
						className: 'signin--loginbtn signin--headerbtn btn icon-left',
						events: {
							click: (c, e) => {
								this._toggleMenu(c.getNode('menubtn'));
								e.stopPropagation();
							},
						},
					}, [
						n.component(new FAIcon('user')),
						n.component(new Txt(l10n.l('signIn.account', "Account"))),
					]),
				])),
			},
			{
				condition: m => m.error,
				factory: m => new Elem(n => n.elem('div', { className: 'signin' }, [
					// n.elem('button', { className: 'signin--helpbtn signin--headerbtn iconbtn' }, [
					// 	n.component(new FAIcon('question')),
					// ]),
					n.elem('button', {
						className: 'signin--joinbtn signin--headerbtn btn',
						events: {
							click: (c, e) => {
								this.module.auth.redirectToRegister();
								e.stopPropagation();
							},
						},
					}, [
						n.component(new Txt(l10n.l('signIn.register', "Register"))),
					]),
					n.elem('button', {
						className: 'signin--loginbtn signin--headerbtn btn icon-left',
						events: {
							click: (c, e) => {
								this.module.auth.redirectToLogin();
								e.stopPropagation();
							},
						},
					}, [
						n.component(new FAIcon('sign-in')),
						n.component(new Txt(l10n.l('signIn.signIn', "Sign in"))),
					]),
				])),
			},
		]);
		return this.elem.render(el);
	}

	unrender() {
		this.elem?.unrender();
		this.elem = null;
	}

	_toggleMenu(el) {
		if (!this.elem) return;

		if (this.menuComponent) {
			this._closeMenu();
		} else {
			this._openMenu(el);
		}
	}

	_openMenu(el) {
		if (this.menuComponent || !this.elem) return;

		// Calculate position of button
		let rect = el.getBoundingClientRect();

		this.menuComponent = new SignInMenu(this.module, {
			top: rect.bottom + 6,
			right: document.body.clientWidth - rect.right,
			onSelect: route => {
				// this.module.router.setRoute(route.id);
				this._closeMenu();
			},
		});

		this.menuComponent.render(document.body);
		this._setListeners(true);
	}

	_closeMenu() {
		if (!this.menuComponent) return;

		this._setListeners(false);
		this.menuComponent.unrender();
		this.menuComponent = null;
	}

	_setListeners(on) {
		let cb = on ? 'addEventListener' : 'removeEventListener';
		document[cb]('keydown', this._closeMenu);
		document[cb]('click', this._closeMenu);
	}
}

export default SignInComponent;
