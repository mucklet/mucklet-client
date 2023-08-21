import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ImgModal from 'classes/ImgModal';

const sections = [
	{ title: null, body: l10n.l('greetingScreen.welcome', "Welcome to Wolfery!") },
	{ title: l10n.l('greetingScreen.whatIsThis', "What is this?"), body: l10n.l('greetingScreen.whatIsThisBody', "A textual world of roleplay. Create a character, wake them up, and join in. Or peek at this <a href=\"/img/screenshot.png\" class=\"greeting-screenshot link\" target=\"_blank\">screenshot</a> first.") },
	{ title: l10n.l('greetingScreen.roleplayChat', "Is it a roleplay chat?"), body: l10n.l('greetingScreen.roleplayChatBody', "Yes, but it's even more! Much like text-based MUCK games, you can explore and create lasting worlds for you and others to roleplay in.") },
	{ title: l10n.l('greetingScreen.ageLimit', "Is there an age limit?"), body: l10n.l('greetingScreen.ageLimitBody', "You must be at least be 18 to register. Any type of roleplay is allowed, including sexual roleplay. Some characters may also have explicit descriptions or images.") },
	{ title: l10n.l('greetingScreen.getStarted', "How to get started?"), body: l10n.l('greetingScreen.getStartedBody', "Click the button below, register an account, and create a character. Once inside the realm, you can always find friendly people willing to help you out.") },
];

class GreetingScreenComponent {

	constructor(module, err) {
		this.module = module;
		this.err = err;

		// Set policy link bindings
		this._links = [
			{
				className: 'greeting-screenshot',
				onClick: this._onClickImg.bind(this, '/img/screenshot.png', '/img/screenshot_mobile.png'),
			},
		];
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'greetingscreen' }, [
			n.elem('div', { className: 'greetingscreen--container' }, [
				n.elem('h1', { className: 'greetingscreen--header' }, [
					n.elem('img', { className: 'greetingscreen--logo', attributes: { src: '/img/paw.svg' }}),
					n.text(APP_TITLE),
					n.elem('span', { className: 'greetingscreen--com' }, [
						n.text(".com"),
					]),
				]),
				n.elem('img', { className: 'greetingscreen--img', attributes: { src: '/img/miranda_269x506.png' }}),
				n.elem('div', { className: 'greetingscreen--body common--formattext' }, sections.map(s => n.elem('div', [
					n.component(s.title ? new Txt(s.title, { tagName: 'h3', className: 'margin-bottom-m' }) : null),
					n.component(s.body ? new Html(s.body, { tagName: 'p' }) : null),
				]))),
				n.elem('div', { className: 'greetingscreen--foot' }, [
					n.elem('a', {
						className: 'greetingscreen--btn btn large primary full-width',
						attributes: { href: 'javascript:;' },
						events: {
							click: (c, ev) => {
								ev.preventDefault();
								this.module.auth.redirectToLogin(true);
							},
						},
	 				}, [
						n.component(new Txt(l10n.l('greetingScreen.goToLogin', "Go to login"))),
					]),
				]),
			]),
		]));
		let rel = this.elem.render(el);

		for (let p of this._links) {
			p.links = [];
			let links = rel.getElementsByClassName(p.className);
			for (let l of links) {
				l.setAttribute('href', 'javascript:;');
				l.addEventListener('click', p.onClick);
				p.links.push(l);
			}
		}
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onClickImg(url, urlMobile, ev) {
		ev.preventDefault();

		if (urlMobile && window.matchMedia('screen and (max-width: 720px)').matches) {
			url = urlMobile;
		}
		new ImgModal(url).open();
	}
}

export default GreetingScreenComponent;
