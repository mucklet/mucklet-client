import { Elem, Txt } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';


/**
 * SignInMenu renders the menu for the account button.
 */
class SignInMenu {

	constructor(module, opt) {
		this.module = module;
		this.opt = opt || {};

		// Bind callbacks
		// style: 'top: ' + top + 'px; right: ' + right + 'px;'
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', {
			className: 'signin-menu',
			attributes: {
				style: 'top: ' + (this.opt.top || '0') + 'px; right: ' + (this.opt.right || '0') + 'px;',
			},
		}, [
			n.component(new CollectionList(
				this.module.self.getMenuItems(),
				item => new Elem(n => n.elem('a', {
					className: 'signin-menu--item' + (item.className ? ' ' + item.className : ''),
					attributes: {
						href: item.href,
					},
					events: item.onClick && {
						click: (c, e) => {
							e.stopPropagation();
							item.onClick?.();
						},
					},
				}, [
					n.component(new FAIcon(item.icon, { className: 'signin-menu--icon' })),
					n.component(new Txt(item.name)),
				])),
				{
					className: 'signin-menu--items',
				},
			)),
			n.elem('a', {
				className: 'signin-menu--logout',
				events: {
					click: (c, e) => {
						this.module.auth.logout(true);
						e.stopPropagation();
					},
				},
			}, [
				n.component(new FAIcon('sign-out', { className: 'signin-menu--logouticon' })),
				n.component(new Txt(l10n.l('signIn.logOut', "Log out"))),
			]),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_select(route) {
		if (this.opt.onSelect) {
			this.opt.onSelect(route);
		}
	}
}

export default SignInMenu;
