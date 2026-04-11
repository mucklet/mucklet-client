import { Elem, Txt, Html } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import Img from 'components/Img';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';
import RealmTagsList, { hasTags } from 'components/RealmTagsList';
import socialLinks, { hasLink } from 'utils/socialLinks';

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

class GreetingScreenRealm {

	constructor(module, info, realm, population) {
		this.module = module;
		this.info = info;
		this.realm = realm;
		this.tags = realm?.tags;
		this.population = population;
		let appRealm = this.module.self.app.props.realm;
		this.hasImage = !!appRealm?.image;
		this.hasIcon = !!appRealm?.icon;


	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'greetingscreen' }, [
			n.elem('div', { className: 'greetingscreen--card' }, [
				n.elem('div', { className: 'greetingscreen--realm' }, [

					// Image
					n.component(new Img(this.hasImage ? '/img/realm.png' : '/img/realm-placeholder.svg', {
						className: 'greetingscreen--img' + (this.hasImage ? '' : ' placeholder'),
						renderingHeader: false,
					})),

					n.elem('div', { className: 'greetingscreen--content' }, [

						// Header
						n.elem('div', { className: 'greetingscreen--header' }, [

							// Icon
							n.component(new Img(this.hasIcon ? '/img/realmicon-l.png' : '/img/realmicon-placeholder.svg', {
								className: 'greetingscreen--icon' + (this.hasIcon ? '' : ' placeholder'),
								renderingHeader: false,
							})),

							n.elem('div', { className: 'greetingscreen--title-cont' }, [

								// Title
								n.elem('span', { className: 'greetingscreen--title' }, [
									n.component(new Txt(this.module.self.app.props.realm.name)),
								]),

								n.elem('div', { className: 'greetingscreen--counters' }, [
									n.elem('div', { className: 'greetingscreen--counter' }, [
										n.elem('span', { className: 'greetingscreen--dot highlight' }),
										n.component(new ModelTxt(this.population, m => l10n.l('realmList.countAwake', "{count} Awake", { count: formatNumber(m?.awakeChars) }), {
											duration: 0,
										})),
									]),
									n.elem('div', { className: 'greetingscreen--counter' }, [
										n.elem('span', { className: 'greetingscreen--dot' }),
										n.component(new ModelTxt(this.population, m => l10n.l('realmList.countCharacters', "{count} Characters", { count: formatNumber(m?.totalChars) }), {
											duration: 0,
										})),
									]),
								]),
							]),
						]),

						n.elem('div', { className: 'greetingscreen--sidebar' }, [

							// Sign in button
							n.elem('div', { className: 'greetingscreen--button' }, [
								n.elem('button', {
									events: {
										click: (c, ev) => {
											ev.preventDefault();
											this.module.auth.redirectToLogin(true);
										},
									},
									attributes: { type: 'submit' },
									className: 'btn primary greetingscreen--signin icon-left',
								}, [
									n.component(new Txt(l10n.l('login.signIn', "Sign in"))),
									n.component(new FAIcon('sign-in')),
								]),
							]),

							// Tags
							// Only show tags if there is at least one valid tag.
							n.component(new ModelComponent(
								this.tags,
								new Collapser(),
								(m, c) => c.setComponent(hasTags(m)
									? c.getComponent() || new Elem(n => n.elem('div', { className: 'greetingscreen--infosection' }, [
										n.component(new Txt(l10n.l('greetingScreen.tags', "Tags"), { tagName: 'h4', className: 'greetingscreen--infotitle' })),
										n.component(new RealmTagsList(m, { className: 'greetingscreen--tags', static: true })),
									]))
									: null,
								),
							)),

							// Social
							// Only show social if there is at least one valid account.
							n.component(new ModelComponent(
								this.realm,
								new Collapser(),
								(m, c, change) => {
									if (!change || change.hasOwnProperty('links')) {
										let links = m.links;
										c.setComponent(hasLink(links)
											? c.getComponent() || new Elem(n => n.elem('div', { className: 'greetingscreen--infosection' }, [
												n.component(new Txt(l10n.l('greetingScreen.socialLinks', "Social links"), { tagName: 'h4', className: 'greetingscreen--infotitle' })),
												n.component(new Elem(n => n.elem('div', { className: 'greetingscreen--links' },
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
										);
									}
								},
							)),

						]),

						// Description
						n.elem('div', { className: 'greetingscreen--desc' }, [
							n.component(new ModelComponent(
								this.info,
								new Html("", { className: 'common--desc-size', mode: 'default' }),
								(m, c) => c.setHtml(m.greeting),
							)),
						]),
					]),
				]),

				// Footer
				n.elem('div', { className: 'greetingscreen--footer' }, [
					n.elem('a', {
						className: 'greetingscreen--footer-logo',
						attributes: {
							href: 'https://mucklet.com',
						},
					}, [
						n.elem('img', {
							className: 'greetingscreen--footer-logo-img',
							attributes: { src: '/mucklet-logo.svg' },
						}),
						n.elem('span', { className: 'greetingscreen--footer-logo-text' }, [
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

export default GreetingScreenRealm;
