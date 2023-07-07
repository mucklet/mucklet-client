import { RootElem, Elem, Txt, Context } from 'modapp-base-component';
import { CollectionList, ModelComponent } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import Hamburger from 'components/Hamburger';
import KebabMenu from 'components/KebabMenu';
import HubLayoutFooter from './HubLayoutFooter';
import HubLayoutMenuItem from './HubLayoutMenuItem';

/**
 * HubLayoutComponent renders the main app layout.
 */
class HubLayoutComponent {

	constructor(module, model, user) {
		this.module = module;
		this.model = model;
		this.user = user;

		// Bind callbacks
		this._closeMenu = this._closeMenu.bind(this);
		this._onMenuClick = this._onMenuClick.bind(this);
	}

	render(el) {
		let renderedRouteComponent = null;

		this.elem = new ModelComponent(
			this.model,
			new Elem(n => (
				n.elem('div', { className: 'hublayout' }, [
					n.elem('div', { className: 'hublayout--container' }, [
						n.elem('sidepanel', 'div', {
							className: 'hublayout--sidepanel',
							events: { click: (c, e) => e.stopPropagation() }, // Prevent closing menu when clicking on it.
						}, [
							n.elem('div', { className: 'hublayout--panelhead' }, [
								n.elem('div', { className: 'hublayout--profile' }, [
									n.component(new ModelComponent(
										this.user,
										new ModelComponent(
											null,
											new Fader(),
											(m, c, changed) => c.setComponent(new RootElem('img', {
												className: 'hublayout--profileimage',
												attributes: { src: m ? m.href : '/paw-bg.svg' },
											})),
										),
										(m, c, changed) => {
											c.setModel(m.image);
										},
									)),
									n.elem('div', { className: 'hublayout--profilename' }, [
										n.component(new Txt(l10n.l('hubLayout.account', "Mucklet account"), { tagName: 'h2' })),
									]),
								]),
							]),
							n.elem('div', { className: 'hublayout--panelmain' }, [
								n.component(new Context(
									() => new CollectionWrapper(this.module.router.getRoutes(), {
										eventBus: this.module.self.app.eventBus,
										filter: r => !r.hidden
											&& !r.parentId,
									}),
									routes => routes.dispose(),
									routes => new CollectionList(routes, route => (route.menuComponent
										? (typeof route.menuComponent == 'function'
											? route.menuComponent(route, 'menuitem-' + route.id, this._closeMenu)
											: route.menuComponent
										)
										: new HubLayoutMenuItem(this.module, route, { onClick: this._onMenuClick })

									), { className: 'hublayout--menu' }),
								)),
							]),
							n.elem('div', { className: 'hublayout--panelfooter' }, [
								n.component(new HubLayoutFooter(this.module)),
							]),
							// n.elem('a', {
							// 	className: 'hublayout--logout',
							// 	events: { click: () => this.module.auth.logout() },
							// }, [
							// 	n.component(new Txt(l10n.l('hubLayout.logout', "Logout"))),
							// ]),
						]),
						n.elem('div', { className: 'hublayout--maincontainer' }, [
							n.elem('div', { className: 'hublayout--header' }, [
								n.component(new Context(
									() => new CollectionWrapper(this.module.self.getTools(), {
										filter: t => !t.type || t.type == 'header' && (t.filter ? t.filter() : true),
									}),
									tools => tools.dispose(),
									tools => new CollectionList(
										tools,
										t => t.componentFactory(),
										{
											className: 'hublayout--headertools',
											subClassName: t => t.className || null,
											horizontal: true,
										},
									),
								)),
								n.elem('div', { className: 'hublayout--headercontent' }, [
									n.component('hamburger', new Hamburger({
										className: 'hublayout--hamburger',
										onToggle: (c, menuOpen) => this.module.self.toggleMenu(menuOpen),
									})),
									n.elem('div', { className: 'hublayout-common--maxwidth' }, [
										n.elem('a', { className: 'flex-row flex-center sm', events: { click: () => this.module.router.setDefaultRoute() }}, [
											n.elem('img', { className: 'hublayout--logo flex-auto', attributes: { src: '/paw-bg.svg' }}),
											n.component(new Txt(l10n.l('hubLayout.account', "Mucklet account"), { tagName: 'h3' })),
											n.component(new Context(
												() => new CollectionWrapper(this.module.self.getTools(), {
													filter: t => !t.type || t.type == 'logo' && (t.filter ? t.filter() : true),
												}),
												tools => tools.dispose(),
												tools => new CollectionList(
													tools,
													t => t.componentFactory(),
													{
														className: 'hublayout--logotools flex-1 flex-row sm',
														subClassName: t => t.className || null,
														horizontal: true,
													},
												),
											)),
											n.component(new KebabMenu(this.module.playerTools.getTools(), {
												className: 'hublayout--kebabmenu',
												btnClassName: 'iconbtn medium solid',
												topMargin: 10,
											})),
										]),
									]),
								]),
							]),
							n.component(new ModelComponent(
								this.module.router.getModel(),
								new Fader(null, { className: 'hublayout--main' }),
								(m, c) => {
									let routeComponent = m.route ? m.route.component : null;
									if (renderedRouteComponent != routeComponent) {
										c.setComponent(!routeComponent
											? routeComponent
											: new Elem(n => n.elem('div', { className: m.route?.fullscreen ? null : 'hublayout--routemaxwidth' }, [
												n.elem('div', { className: 'hublayout--routecontainer' }, [
													n.component(routeComponent),
												]),
											])),
										);
										renderedRouteComponent = routeComponent;
									}
								},
							)),
						]),
					]),
				])
			)),
			(m, c) => {
				c.getNode('hamburger').toggle(this.model.menuOpen, false);
				c[this.model.menuOpen ? 'addNodeClass' : 'removeNodeClass']('sidepanel', 'open');
			},
		);
		let rel = this.elem.render(el);
		if (this.route) {
			this.module.router.setRoute(this.route);
		}
		document.addEventListener('click', this._closeMenu, false);
		return rel;
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_isActive(route) {
		let c = this.module.router.getCurrent();
		return c && c.route && c.route.id === route.id;
	}

	_onMenuClick(route) {
		this.module.router.setRoute(route.id);
		this._closeMenu();
	}

	_closeMenu() {
		this.module.self.toggleMenu(false);
	}
}

export default HubLayoutComponent;
