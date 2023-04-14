import { RootElem, Elem, Txt, Context } from 'modapp-base-component';
import { CollectionList, ModelTxt, ModelComponent } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import Hamburger from 'components/Hamburger';

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
									n.component(new Txt(l10n.l('layout.account', "Mucklet account"), { tagName: 'h2' })),
									n.component(new ModelTxt(this.user, m => m.name.trim())),
								]),
							]),
							n.component(new Context(
								() => new CollectionWrapper(this.module.router.getRoutes(), {
									eventBus: this.module.self.app.eventBus,
									filter: r => !r.hidden
										&& !r.parentId,
								}),
								routes => routes.dispose(),
								routes => new CollectionList(routes, route => (route.menuComponent
									? (typeof route.menuComponent == 'function'
										? route.menuComponent(route, 'menuitem-' + route.id)
										: route.menuComponent
									)
									: new ModelComponent(
										this.module.router.getModel(),
										new Elem(n =>
											n.elem('a', {
												className: 'hublayout--menuitem',
												attributes: { id: 'menuitem-' + route.id },
												events: { click: () => this._onMenuClick(route) },
											}, [
												n.component(new Txt(typeof route.name == 'function' ? route.name() : route.name)),
											]),
										),
										(m, c) => c[m.route && m.route.id == route.id
											? 'addClass'
											: 'removeClass'
										]('active'),
									)
								), { className: 'hublayout--menu' }),
							)),
							n.elem('a', {
								className: 'hublayout--logout',
								events: { click: () => this.module.auth.logout() },
							}, [
								n.component(new Txt(l10n.l('layout.logout', "Logga ut"))),
							]),
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
										n.elem('a', { className: 'flex-row sm', events: { click: () => this.module.router.setRoute('dashboard') }}, [
											n.elem('img', { className: 'hublayout--logo flex-auto', attributes: { src: '/paw.png' }}),
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
										c.setComponent(!routeComponent || (m.route && m.route.fullscreen)
											? routeComponent
											: new Elem(n => n.elem('div', { className: 'hublayout-common--maxwidth' }, [ n.component(routeComponent) ])),
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
