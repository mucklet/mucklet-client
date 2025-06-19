import { Context, Elem, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent } from 'modapp-resource-component';
import { Model, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import PanelSection from 'components/PanelSection';
import Collapser from 'components/Collapser';
import PageCharSelectChar from './PageCharSelectChar';
import PageCharSelectPuppet from './PageCharSelectPuppet';

class PageCharSelectComponent {
	constructor(module, state, close) {
		this.module = module;
		state.itemId = state.itemId || null;
		this.state = state;
		this.close = close;
		this.model = null;
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });
		let puppetsComponent = new PanelSection(
			l10n.l('pageCharSelect.puppets', "Puppets"),
			new Context(
				() => new CollectionWrapper(this.module.player.getPuppets(), {
					compare: (a, b) => a.registered - b.registered,
					eventBus: this.module.self.app.eventBus,
				}),
				(puppets) => puppets.dispose(),
				(puppets) => new CollectionList(
					puppets,
					m => new PageCharSelectPuppet(this.module, m, this.model, this.close),
					{ className: 'pagecharselect--puppets' },
				),
			),
			{
				className: 'common--sectionpadding',
			},
		);

		this.elem = new Elem(n => n.elem('div', { className: 'pagecharselect' }, [
			n.component(new Context(
				() => new CollectionWrapper(this.module.player.getChars(), {
					compare: (a, b) => a.created - b.created,
					eventBus: this.module.self.app.eventBus,
				}),
				(chars) => chars.dispose(),
				(chars) => new CollectionList(
					chars,
					char => new PageCharSelectChar(this.module, char, chars, this.model, this.close),
					{ className: 'pagecharselect--chars' },
				),
			)),
			n.elem('div', { className: 'pagecharselect--add' }, [
				n.component(new ModelComponent(
					this.module.onboarding.getModel(),
					new Elem(n => n.elem('add', 'button', { events: { click: () => this._onCreate() }, className: 'btn icon-left' }, [
						n.component(new FAIcon('plus')),
						n.component(new Txt(l10n.l('pageCharSelect.createNew', "Create New"))),
					])),
					(m, c) => m.createChar
						? this._openTip(c.getElement())
						: this._closeTip(),
					{ postrenderUpdate: true },
				)),
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

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this._closeTip(),
			Object.assign(this.state, this.model.props);
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onCreate() {
		this.module.createLimits.validateOwnedChars(() => this.module.dialogCreateChar.open());
	}

	_openTip(el) {
		this.module.onboarding.openTip('pageCharCreateNew', el, {
			priority: 20,
			position: [ 'right', 'bottom' ],
			title: l10n.l('pageCharSelect.getStarted', "Get started"),
			content: l10n.l('pageCharSelect.clickCreateNew', "You have no characters yet. Click \"Create New\" to create your first."),
		});
	}

	_closeTip() {
		this.module.onboarding.closeTip('pageCharCreateNew');
	}
}

export default PageCharSelectComponent;
