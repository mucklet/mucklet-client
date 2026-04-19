import { Elem, Txt, Html } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import Img from 'components/Img';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
import RealmTagsList, { hasTags } from 'components/RealmTagsList';
import socialLinks, { hasLink } from 'utils/socialLinks';
import { getRenderingMode } from 'utils/renderingModes';

function formatNumber(n) {
	if (typeof n != 'number') {
		return "?";
	}
	let s = String(n);
	for (let i = s.length - 3; i > 0; i -= 3) {
		s = s.slice(0, i) + ' ' + s.slice(i);
	}
	return s;
}

function imgClass(className, img) {
	if (!img) {
		className += ' realminfo--img';
	} else {
		let mode = getRenderingMode(img.rendering);
		if (mode?.className) {
			className += ' ' + mode.className;
		}
	}
	return className.trim();
}

class RealmInfoComponent {

	/**
	 *
	 * @param {object} module Modules.
	 * @param {Model} info Realm info model.
	 * @param {Model} tags Realm tags model.
	 * @param {Model} links Realm links model.
	 * @param {Model} population Population model.
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.withSignIn] Flag to enable sign in.
	 * @param {boolean} [opt.withSponsor] Flag to enable sponsor button.
	 */
	constructor(module, info, tags, links, population, opt) {
		this.module = module;
		this.info = info;
		this.tags = tags;
		this.links = links;
		this.population = population;
		this.opt = opt;
		let appRealm = this.module.self.app.props.realm;
		this.name = appRealm?.name;
		this.image = appRealm?.image;
		this.icon = appRealm?.icon;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'realminfo' + (this.opt?.className ? ' ' + this.opt.className : '') }, [
			n.elem('div', { className: 'realminfo--card' }, [
				n.elem('div', { className: 'realminfo--realm' }, [

					// Image
					n.component(new Img(this.image ? '/img/realm.png' : '/img/realm-placeholder.svg', {
						className: imgClass('realminfo--img', this.image),
					})),

					n.elem('div', { className: 'realminfo--content' }, [

						// Header
						n.elem('div', { className: 'realminfo--header' }, [

							// Icon
							n.component(new Img(this.icon ? '/img/realmicon-l.png' : '/img/realmicon-placeholder.svg', {
								className: imgClass('realminfo--icon', this.icon),
							})),

							n.elem('div', { className: 'realminfo--title-cont' }, [

								// Title
								n.elem('span', { className: 'realminfo--title' }, [
									n.component(new Txt(this.name)),
								]),

								n.elem('div', { className: 'realminfo--counters' }, [
									n.elem('div', { className: 'realminfo--counter' }, [
										n.elem('span', { className: 'realminfo--dot highlight' }),
										n.component(new ModelTxt(this.population, m => l10n.l('realmList.countAwake', "{count} Awake", { count: formatNumber(m?.awakeChars) }), {
											duration: 0,
										})),
									]),
									n.elem('div', { className: 'realminfo--counter' }, [
										n.elem('span', { className: 'realminfo--dot' }),
										n.component(new ModelTxt(this.population, m => l10n.l('realmList.countCharacters', "{count} Characters", { count: formatNumber(m?.totalChars) }), {
											duration: 0,
										})),
									]),
								]),
							]),
						]),

						n.elem('div', { className: 'realminfo--sidebar' }, [

							// Sign in button
							...(this.opt?.withSignIn
								? [
									n.elem('div', { className: 'realminfo--button' }, [
										n.elem('button', {
											events: {
												click: (c, ev) => {
													ev.preventDefault();
													this.module.auth.redirectToLogin(true);
												},
											},
											attributes: { type: 'submit' },
											className: 'btn primary realminfo--signin icon-left',
										}, [
											n.component(new Txt(l10n.l('login.signIn', "Sign in"))),
											n.component(new FAIcon('sign-in')),
										]),
									]),
								]
								: []
							),

							// Tags
							// Only show tags if there is at least one valid tag.
							n.component(new ModelComponent(
								this.tags,
								new Collapser(),
								(m, c) => c.setComponent(hasTags(m)
									? c.getComponent() || new Elem(n => n.elem('div', { className: 'realminfo--infosection' }, [
										n.component(new Txt(l10n.l('realmInfo.tags', "Tags"), { tagName: 'h4', className: 'realminfo--infotitle' })),
										n.component(new RealmTagsList(m, { className: 'realminfo--tags', static: true })),
									]))
									: null,
								),
							)),

							// Social
							// Only show social if there is at least one valid account.
							n.component(new ModelComponent(
								this.links,
								new Collapser(),
								(links, c) => c.setComponent(hasLink(links)
									? c.getComponent() || new Elem(n => n.elem('div', { className: 'realminfo--infosection' }, [
										n.component(new Txt(l10n.l('realmInfo.socialLinks', "Social links"), { tagName: 'h4', className: 'realminfo--infotitle' })),
										n.component(new Elem(n => n.elem('div', { className: 'realminfo--links' },
											socialLinks
												.filter(l => !!links[l.id])
												.map(l => n.elem('a', {
													className: 'iconbtn solid semilarge' + (l.svg ? ' svg' : ''),
													attributes: {
														href: links[l.id],
														rel: 'noopener noreferrer',
														'aria-label': l10n.t(l.name),
													},
												}, [
													l.svg
														? n.html(l.svg)
														: n.component(new FAIcon(l.icon)),
												])),
										))),
									]))
									: null,
								),
							)),

						]),

						// Description
						n.elem('div', { className: 'realminfo--desc' }, [
							n.component(new ModelComponent(
								this.info,
								new Html("", { className: 'common--desc-size', mode: 'default' }),
								(m, c) => c.setHtml(m.greeting),
							)),
						]),
					]),
				]),

				// Footer
				n.elem('div', { className: 'realminfo--footer' }, [
					n.elem('a', {
						className: 'realminfo--footer-logo',
						attributes: {
							href: 'https://mucklet.com',
						},
					}, [
						n.elem('img', {
							className: 'realminfo--footer-logo-img',
							attributes: { src: '/mucklet-logo.svg' },
						}),
						n.elem('span', { className: 'realminfo--footer-logo-text' }, [
							n.text("mucklet.com"),
						]),
					]),
				]),

			]),

		]));
		let rel = this.elem.render(el);
		return rel;
	}


	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default RealmInfoComponent;
