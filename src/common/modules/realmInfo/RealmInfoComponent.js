import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import Img from 'components/Img';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
import RealmTagsList, { hasTags } from 'components/RealmTagsList';
import socialLinks, { hasLink } from 'utils/socialLinks';
import { getRenderingMode } from 'utils/renderingModes';
import ResizeObserverComponent from 'components/ResizeObserverComponent';
import ModelCollapser from 'components/ModelCollapser';
import FormatTxt from 'components/FormatTxt';
import RealmPlaceholder from 'components/RealmPlaceholder';
import RealmIconPlaceholder from 'components/RealmIconPlaceholder';

const narrowWidth = 720;
const txtAboutPlaceholder = l10n.t('realmInfo.aboutPlaceholder', "_This is a new realm yet to be described._");

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
	let mode = getRenderingMode(img.rendering);
	if (mode?.className) {
		className += ' ' + mode.className;
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
	 * @param {boolean} [opt.withSupporter] Flag to enable supporter button.
	 * @param {boolean} [opt.withFooter] Flag to enable footer Mucklet icon.
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

		// Bind callbacks
		this._onResize = this._onResize.bind(this);
	}

	render(el) {
		// Get playerModule if loaded.
		let playerModule = this.opt?.withSupporter && this.module.self.app.getModule('player');

		let content = new Elem(n => n.elem('div', { className: 'realminfo' + (this.opt?.className ? ' ' + this.opt.className : '') }, [
			n.elem('div', { className: 'realminfo--card' }, [
				n.elem('div', { className: 'realminfo--realm' }, [

					// Image
					n.component(this.image
						? new Img('/img/realm.png', {
							className: imgClass('realminfo--img', this.image),
						})
						: new RealmPlaceholder({
							className: 'realminfo--img placeholder',
						}),
					),

					n.elem('div', { className: 'realminfo--content' }, [

						// Header
						n.elem('div', { className: 'realminfo--header' }, [

							// Icon
							n.component(this.icon
								? new Img('/img/realmicon-l.png', {
									className: imgClass('realminfo--icon', this.icon),
								})
								: new RealmIconPlaceholder({
									className: 'realminfo--icon placeholder',
								}),
							),

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
									n.elem('div', { className: 'realminfo--signin' }, [
										n.elem('button', {
											events: {
												click: (c, ev) => {
													ev.preventDefault();
													this.module.auth.redirectToLogin(true);
												},
											},
											attributes: { type: 'submit' },
											className: 'btn primary realminfo--btn icon-left',
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
													className: 'iconbtn default-400 filled semilarge' + (l.svg ? ' svg' : ''),
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

							// Support button
							...(this.opt?.withSupporter
								? [
									n.component(new ModelCollapser(playerModule?.getModel(), [
										{
											condition: m => playerModule && !playerModule?.hasIdRoles('supporter'),
											factory: m => new Elem(n => n.elem('div', { className: 'realminfo--support' }, [
												n.elem('button', {
													events: {
														click: (c, ev) => {
															ev.preventDefault();
															this._openSupporter();
														},
													},
													attributes: { type: 'submit' },
													className: 'btn primary small full-width',
												}, [
													n.component(new FAIcon('heart')),
													n.component(new Txt(l10n.l('login.becomeASupporter', "Become a supporter"))),
												]),
											])),
										},
										{
											condition: m => playerModule && playerModule?.hasIdRoles('supporter'),
											factory: m => new Txt(l10n.l('realmInfo.thanksForTheSupport', "Thanks for your support!"), { tagName: 'div', className: 'realminfo--supporter' }),
										},
									])),
								]
								: []
							),

						]),

						// Description
						n.elem('div', { className: 'realminfo--desc' }, [
							n.component(new ModelComponent(
								this.info,
								new FormatTxt('', { className: 'common--desc-size' }),
								(m, c) => c.setFormatText(m.about || txtAboutPlaceholder),
							)),
						]),
					]),
				]),

				// Footer
				...(this.opt?.withFooter
					? [
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
					]
					: []
				),

			]),

		]));

		this.elem = new ResizeObserverComponent(content, this._onResize);
		return this.elem.render(el);
	}


	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onResize(rect) {
		let el = this.elem?.getComponent();
		if (!el || !rect) return;

		if (rect.width < narrowWidth) {
			el.addClass('realminfo--narrow');
		} else {
			el.removeClass('realminfo--narrow');
		}
	}

	_openSupporter() {
		this.module.auth.redirectToHub('account#overview');
	}
}

export default RealmInfoComponent;
