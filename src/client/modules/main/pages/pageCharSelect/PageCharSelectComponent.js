import { Elem, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import PanelSection from 'components/PanelSection';
import Collapser from 'components/Collapser';
import PopupTip from 'components/PopupTip';
import PageCharSelectChar from './PageCharSelectChar';
import PageCharSelectPuppet from './PageCharSelectPuppet';

class PageCharSelectComponent {
	constructor(module, state, close) {
		this.module = module;
		state.itemId = state.itemId || null;
		this.state = state;
		this.close = close;
		this.model = null;

		// Bind callbacks
		this._onCreate = this._onCreate.bind(this);
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });
		let puppetsComponent = new PanelSection(
			l10n.l('pageCharSelect.puppets', "Puppets"),
			new CollectionList(
				this.module.player.getPuppets(),
				m => new PageCharSelectPuppet(this.module, m, this.model, this.close),
				{ className: 'pagecharselect--puppets' },
			),
			{
				className: 'common--sectionpadding',
			},
		);

		let chars = this.module.player.getChars();
		this.elem = new Elem(n => n.elem('div', { className: 'pagecharselect' }, [
			n.component(new CollectionComponent(
				chars,
				new CollectionList(
					chars,
					char => new PageCharSelectChar(this.module, char, this.model, this.close),
					{ className: 'pagecharselect--chars' },
				),
				(col, c, ev) => {
					if (ev) {
						if (col.length) {
							this._closePopupTip();
						} else {
							this._openPopupTip();
						}
					}
				},
			)),
			n.elem('div', { className: 'pagecharselect--add' }, [
				n.elem('add', 'button', { events: { click: this._onCreate }, className: 'btn icon-left' }, [
					n.component(new FAIcon('plus')),
					n.component(new Txt(l10n.l('pageCharSelect.createNew', "Create New"))),
				]),
			]),
			n.component(new CollectionComponent(
				this.module.player.getPuppets(),
				new Collapser(),
				(col, c) => c.setComponent(col.length
					? puppetsComponent
					: null,
				),
			)),
		]));
		let rel = this.elem.render(el);
		if (chars.length == 0) {
			this._openPopupTip();
		}
		return rel;
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, this.model.props);
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
		this._closePopupTip();
	}

	_onCreate() {
		this.module.createLimits.validateOwnedChars(() => this.module.dialogCreateChar.open());
	}

	_closePopupTip() {
		if (this.popupTip) {
			this.popupTip.unrender();
			this.popupTip = null;
		}
	}

	_openPopupTip() {
		let el = this.module.screen.getFader().getElement();
		if (!el || !this.elem || this.popupTip) return;

		let rect = this.elem.getNode('add').getBoundingClientRect();

		this.popupTip = new PopupTip(new Elem(n => n.elem('div', { className: 'pagecharselect--add-tip-body' }, [
			n.component(new Txt(l10n.l('pageCharSelect.getStarted', "Get started"), { tagName: 'h3' })),
			n.component(new Txt(l10n.l('pageCharSelect.clickCreateNew', "You have no characters yet. Click \"Create New\" to create your first."))),
		])), {
			noIcon: true,
			noToggle: true,
			position: 'right',
			className: 'pagecharselect--add-tip popuptip--width-m',
			attributes: {
				style: "top:" + (rect.top + rect.bottom) / 2 + "px; left: " + rect.right + "px",
			},
		});

		this.popupTip.render(el);
	}
}

export default PageCharSelectComponent;
