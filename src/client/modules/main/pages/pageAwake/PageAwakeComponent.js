import { Elem, Txt, Context, Input } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent } from 'modapp-resource-component';
import { CollectionWrapper, Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import LabelToggleBox from 'components/LabelToggleBox';
import FAIcon from 'components/FAIcon';
import PageAwakeChar from './PageAwakeChar';

class PageAwakeComponent {
	constructor(module, state) {
		this.module = module;
		this.state = Object.assign(state, { watchForOpen: true }, state); //, selectedCharId: null }, state);
		this.model = null;

		// Bind callbacks
		this._onCreate = this._onCreate.bind(this);
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });
		let charsAwakeModel = this.module.charsAwake.getModel();
		let watchedAwake = this.module.charsAwake.getWatchedAwake();
		let unwatchedAwake = this.module.charsAwake.getUnwatchedAwake();

		this.elem = new Elem(n => n.elem('div', { className: 'pageawake' }, [
			n.component(new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => (t.type || 'realm') == 'realm' && (t.filter ? t.filter() : true)
				}),
				tools => tools.dispose(),
				tools => new CollectionComponent(
					tools,
					new Collapser(),
					(col, c, ev) => {
						// Collapse if we have no tools to show
						if (!col.length) {
							c.setComponent(null);
							return;
						}

						if (!ev || (col.length == 1 && ev.event == 'add')) {
							c.setComponent(new CollectionList(
								tools,
								t => t.componentFactory(),
								{
									className: 'pageawake--tools',
									subClassName: t => t.className || null,
									horizontal: true,
								}
							));
						}
					}
				)
			)),
			n.component(new ModelComponent(
				charsAwakeModel,
				new Elem(n => n.elem('div', [
					n.component('show', new LabelToggleBox(l10n.l('pageAwake.showAll', "Show all"), false, {
						className: 'common--formmargin ',
						onChange: v => this.module.charsAwake.toggleShowAll(v),
						popupTip: l10n.l('pageAwake.showAllInfo', "Show all awake characters, not only those being watched for."),
						popupTipClassName: 'popuptip--width-s'
					})),
					n.elem('div', { className: 'pageawake--filter' }, [
						n.component('filter', new Input('', {
							className: 'margin-bottom-l',
							events: { input: c => this.module.charsAwake.setFilter(c.getValue()) },
							attributes: {
								placeholder: l10n.t('pageAwake.searchFilter', "Search filter"),
								spellcheck: 'false'
							}
						})),
						n.elem('clear', 'button', {
							className: 'pageawake--filter-clear iconbtn medium tinyicon',
							attributes: { type: 'button' },
							events: {
								click: (c, e) => {
									this.module.charsAwake.setFilter("");
									e.preventDefault();
								}
							}
						}, [
							n.component(new FAIcon('times')),
						])
					]),
					// Watched for characters
					n.component(new CollectionComponent(
						watchedAwake,
						new Collapser(),
						(col, c, ev) => c.setComponent(col.length
							? null
							: new Txt(l10n.l('pageAwake.nooneAwake', "Everyone watched is asleep"), { className: 'common--nolistplaceholder' })
						)
					)),
					n.component(new CollectionList(watchedAwake, m => new PageAwakeChar(this.module, m), { // }, this.model), {
						className: 'pageawake--watched'
					})),
					// Non-watched for characters
					n.component('unwatched', new Collapser())
				])),
				(m, c, change) => {
					if (!change || change.hasOwnProperty('showAll')) {
						// Update show all togglebox
						c.getNode('show').setValue(m.showAll, false);
						// Show/hide unwatched
						c.getNode('unwatched').setComponent(m.showAll
							? new Elem(n => n.elem('div', [
								n.component(new CollectionList(unwatchedAwake, m => new PageAwakeChar(this.module, m), { //, this.model), {
									className: 'pageawake--unwatched'
								})),
								n.component(new CollectionComponent(
									unwatchedAwake,
									new Collapser(),
									(col, c, ev) => c.setComponent(col.length
										? null
										: new CollectionComponent(
											this.module.charsAwake.getCollection(),
											new Txt("", { className: 'common--nolistplaceholder' }),
											(col, c) => c.setText(col.length
												? l10n.l('pageAwake.butNooneElseAwake', "... everyone else is asleep.")
												: l10n.l('pageAwake.nooneAwake', "... and so is everyone else.")
											)
										)
									)
								))
							]))
							: null
						);
					}
					// Set filter input value
					c.getNode('filter').setValue(m.filter, false);
					// Set clear button enabled/disabled
					c.setNodeProperty('clear', 'disabled', m.filter ? null : 'disabled');
				}
			))
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, this.model.props);
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onCreate() {
		this.module.createChar.open();
	}
}

export default PageAwakeComponent;
