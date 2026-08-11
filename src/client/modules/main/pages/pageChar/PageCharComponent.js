import { Elem, Txt, Context } from 'modapp-base-component';
import { ModelTxt, ModelComponent, CollectionList } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import CollectionCollapser from 'components/CollectionCollapser';
import Img from 'components/Img';
import PanelSection from 'components/PanelSection';
import NameSection from 'components/NameSection';
import Fader from 'components/Fader';
import FormatTxt from 'components/FormatTxt';
import ModelCollapser from 'components/ModelCollapser';
import CharTagsList, { hasTags } from 'components/CharTagsList';
import ImgModal from 'classes/ImgModal';
import firstLetterUppercase from 'utils/firstLetterUppercase';

const textNotSet = l10n.l('pageChar.notSet', "Not set");

/**
 * PageCharComponent renders character info.
 */
class PageCharComponent {
	constructor(module, ctrl, char, state) {
		this.module = module;
		this.ctrl = ctrl;
		this.char = char;
		this.state = state;
		this.charState = this.state['char_' + char.id] || {};
		this.state['char_' + char.id] = this.charState;
		this.charState.description = this.charState.description || {};
		this.charState.lfrp = this.charState.lfrp || {};
	}

	render(el) {
		let image = new Elem(n => n.elem('div', { className: 'pagechar--image-cont' }, [
			n.component('img', new Img('', { className: 'pagechar--image', events: {
				click: () => new ImgModal(this.char.image.href).open(),
			}})),
		]));
		let o = {};
		let elem = new Elem(n => n.elem('div', [
			n.component(new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => (t.type || 'header') == 'header' && (!t.filter || t.filter(this.ctrl, this.char)),
				}),
				tools => tools.dispose(),
				tools => new CollectionCollapser(tools, [{
					condition: col => col.length,
					factory: col => new CollectionList(
						tools,
						t => t.componentFactory(this.ctrl, this.char),
						{
							className: 'pagechar--tools',
							subClassName: t => t.className || null,
							horizontal: true,
						},
					),
				}]),
			)),
			n.component(new ModelComponent(
				this.char,
				new NameSection(new ModelTxt(this.char, c => c.name + ' ' + c.surname), null, {
					open: this.state.charImageOpen,
					onToggle: (c, v) => this.state.charImageOpen = v,
				}),
				(m, c, changed) => {
					if (m.image) {
						image.getNode('img').setSrc(m.image.href + "?thumb=xxl");
						c.setComponent(image);
					} else {
						c.setComponent(null);
					}
				},
			)),
			n.elem('div', { className: 'flex-row pad8 common--sectionpadding' }, [
				n.elem('div', { className: 'flex-1' }, [
					n.component(new Txt(l10n.l('pageChar.gender', "Gender"), { tagName: 'h3', className: 'margin-bottom-m' })),
					n.elem('div', [
						n.component(new ModelComponent(
							this.char,
							new Txt(),
							(m, c) => {
								c.setText(m.gender ? firstLetterUppercase(m.gender) : textNotSet);
								c[m.gender ? 'removeClass' : 'addClass']('pagechar--notset');
							},
						)),
					]),
				]),
				n.elem('div', { className: 'flex-1' }, [
					n.component(new Txt(l10n.l('pageChar.species', "Species"), { tagName: 'h3', className: 'margin-bottom-m' })),
					n.elem('div', [
						n.component(new ModelComponent(
							this.char,
							new Txt(),
							(m, c) => {
								c.setText(m.species ? firstLetterUppercase(m.species) : textNotSet);
								c[m.species ? 'removeClass' : 'addClass']('pagechar--notset');
							},
						)),
					]),
				]),
			]),
			n.component(new ModelCollapser(this.char, [
				{
					condition: m => m.rp == 'lfrp' && m.lfrpDesc,
					factory: m => new PanelSection(
						new Elem(n => n.elem('span', { className: 'pagechar--lfrp-header' }, [
							n.component(new Txt(l10n.l('pageChar.lookingForRoleplay', "Looking for roleplay"), { tagName: 'h3' })),
							n.elem('div', { className: 'pagechar--lfrp-counter counter small top-right-overlap highlight' }),
						])),
						new ModelComponent(
							m,
							new FormatTxt("", { className: 'common--desc-size', state: this.charState.lfrp }),
							(m, c) => c.setFormatText(m.lfrpDesc),
						),
						{
							className: 'common--sectionpadding',
							open: this.state.lfrpOpen,
							onToggle: (c, v) => this.state.lfrpOpen = v,
						},
					),
				},
				{
					condition: m => m.rp == 'lfrp',
					factory: m => new Elem(n => n.elem('div', { className: 'pagechar--lfrp-placeholder' }, [
						n.elem('div', { className: 'counter small inline highlight' }),
						n.component(new Txt(l10n.l('pageChar.currentlyLookingForRoleplay', "Currently looking for roleplay."))),
					])),
				},
			])),
			n.component(new PanelSection(
				l10n.l('pageChar.description', "Description"),
				new ModelComponent(
					this.char,
					new FormatTxt("", { className: 'common--desc-size', state: this.charState.description }),
					(m, c) => {
						c.setFormatText(m.desc ? m.desc : l10n.t(textNotSet));
						c[m.desc ? 'removeClass' : 'addClass']('pagechar--notset');
					},
				),
				{
					className: 'common--sectionpadding',
					open: this.state.descriptionOpen,
					onToggle: (c, v) => this.state.descriptionOpen = v,
				},
			)),
			n.component(new ModelComponent(
				this.char,
				new ModelComponent(
					null,
					new Collapser(),
					(m, c) => {
						o.howToPlay = m && m.howToPlay
							? o.howToPlay || new PanelSection(
								l10n.l('pageChar.howToPlay', "How to play"),
								new ModelComponent(
									m,
									new FormatTxt("", { className: 'common--desc-size', state: this.charState.howToPlay }),
									(m, c) => {
										c.setFormatText(m.howToPlay ? m.howToPlay : l10n.t(textNotSet));
										c[m.howToPlay ? 'removeClass' : 'addClass']('pagechar--notset');
									},
								),
								{
									className: 'common--sectionpadding',
									open: this.state.howToPlayOpen,
									onToggle: (c, v) => this.state.howToPlayOpen = v,
								},
							)
							: null;
						c.setComponent(o.howToPlay);
					},
				),
				(m, c) => c.setModel(m.puppetInfo),
			)),
			n.component(new ModelComponent(
				this.char,
				new ModelComponent(
					this.char.tags,
					new Collapser(null),
					(m, c) => this._showAbout(c),
				),
				(m, c) => this._showAbout(c.getComponent()),
			)),
			n.component(new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => t.type == 'footer' && (!t.filter || t.filter(this.ctrl, this.char)),
				}),
				tools => tools.dispose(),
				tools => new CollectionCollapser(tools, [{
					condition: col => col.length,
					factory: col => new CollectionList(
						tools,
						t => t.componentFactory(this.ctrl, this.char),
						{
							className: 'pagechar--footertools',
							subClassName: t => t.className || null,
							horizontal: true,
						},
					),
				}]),
			)),
		]));

		this.elem = new ModelComponent(
			this.char,
			new Fader(null, { className: 'pagechar' }),
			(m, c) => c.setComponent(m.hasOwnProperty('name')
				? elem
				: new Txt(l10n.l('pageChar.whoWasIt', "... Who was I looking at?"), { className: 'common--nolistplaceholder' }),
			),
		);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_isOwned() {
		for (let c of this.module.player.getChars()) {
			if (c.id === this.char.id) return true;
		}
		return false;
	}

	_isControlled() {
		return this.ctrl.id == this.char.id;
	}

	_isAwake() {
		let c = this.module.player.getControlledModel()[this.char.id];
		return c && (c.state == 'awake');
	}

	_wakeupChar() {
		if (!this._isControlled) throw new Error("Cannot wake up char that is controlled.");
		return this.ctrl.call('wakeup');
	}

	_releaseChar() {
		if (!this._isControlled) throw new Error("Char is not controlled");

		return this.ctrl.call('release');
	}

	_showAbout(c) {
		c.setComponent(this.char.about || this.char.type == 'puppet' || this.char.puppeteer || hasTags(this.char.tags)
			? c.getComponent() || new PanelSection(
				l10n.l('pageChar.about', "About"),
				new ModelComponent(
					this.char,
					new Elem(n => n.elem('div', [
						n.component('about', new FormatTxt("", { className: 'common--desc-size', state: this.charState.about })),
						n.component('puppet', new Collapser()),
						n.component('tags', new Collapser()),
					])),
					(m, c, change) => {
						// About text
						c.getNode('about').setFormatText(m.about);

						// Tags
						let tags = c.getNode('tags');
						tags.setComponent(m.tags
							? tags.getComponent() || new CharTagsList(m.tags, {
								className: 'pagechar--tags',
								static: false,
								eventBus: this.module.self.app.eventBus,
								tooltipMargin: 'm',
							})
							: null,
						);

						// Puppeteer info
						let puppet = c.getNode('puppet');
						let component = m.type == 'puppet' || m.puppeteer
							? puppet.getComponent() || new Elem(n => n.elem('div', { className: 'pagechar--puppet' }, [
								n.elem('div', { className: 'counter small inline notice' }),
								n.component('txt', new ModelTxt(
									m.puppeteer,
									m => m
										? l10n.l('pageChar.controlledBy', "Controlled by {fullname}", { fullname: (m.name + ' ' + m.surname).trim() })
										: l10n.l('pageChar.puppet', "Character is a puppet"),
									{
										className: 'pagechar--puppeteer',
									},
								)),
							]))
							: null;
						if (component) {
							component.getNode('txt').setModel(m.puppeteer);
						}
						puppet.setComponent(component);
					},
				),
				{
					className: 'common--sectionpadding',
					open: this.state.aboutOpen || false,
					onToggle: (c, v) => this.state.aboutOpen = v,
				},
			)
			: null,
		);
	}
}

export default PageCharComponent;
