import { Elem, Txt, Context } from 'modapp-base-component';
import { CollectionList, ModelComponent } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
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
			n.component(new Context(
				() => new CollectionWrapper(this.module.router.getRoutes(), {
					eventBus: this.module.self.app.eventBus,
					filter: r => !r.hidden
						&& !r.parentId,
				}),
				routes => routes.dispose(),
				routes => new CollectionList(
					routes,
					route => new ModelComponent(
						this.module.router.getModel(),
						new Elem(n => n.elem('div', {
							className: 'signin-menu--route',
							events: {
								click: (c, e) => {
									this._select(route);
									e.stopPropagation();
								},
							},
						}, [
							n.component('selected', new Fader(null, { className: 'signin-menu--selected' })),
							n.component(new Txt(typeof route.name == 'function' ? route.name() : route.name)),
						])),
						(m, c, change) => {
							let active = m.route && (m.route.id == route.id || m.route.parentId === route.id);
							let selected = c.getNode('selected');
							selected.setComponent(active
								? selected.getComponent() || new FAIcon('check')
								: null,
							);
							c[active ? 'addClass' : 'removeClass']('active');
						},
					),
					{
						className: 'signin-menu--routes',
					},
				),
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
				n.component(new Txt(l10n.l('layoutMin.logout', "Logga ut"))),
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
