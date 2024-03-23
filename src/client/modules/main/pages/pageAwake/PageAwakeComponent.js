import { Elem, Txt, Context, Input } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent } from 'modapp-resource-component';
import { CollectionWrapper, Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';
import LabelToggleBox from 'components/LabelToggleBox';
import FAIcon from 'components/FAIcon';
import PageAwakeChar from './PageAwakeChar';

function countMatches(col) {
	let count = 0;
	for (let c of col) {
		if (c?.match) {
			count++;
		}
	}
	return count;
}

class PageAwakeComponent {
	constructor(module, state) {
		this.module = module;
		this.state = Object.assign(state, { watchForOpen: true }, state); //, selectedCharId: null }, state);
		this.model = null;

		// Bind callbacks
		this._onCountChange = this._onCountChange.bind(this);
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });
		let charsAwakeModel = this.module.charsAwake.getModel();
		let watchedAwake = this.module.charsAwake.getWatchedAwake();
		let unwatchedAwake = this.module.charsAwake.getUnwatchedAwake();
		this.countCtx = { fader: new Fader() };

		this.elem = new Elem(n => n.elem('div', { className: 'pageawake' }, [
			n.component(new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => (t.type || 'realm') == 'realm' && (t.filter ? t.filter() : true),
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
								},
							));
						}
					},
				),
			)),
			n.component(new ModelComponent(
				charsAwakeModel,
				new Elem(n => n.elem('div', [
					n.component('show', new LabelToggleBox(l10n.l('pageAwake.showLfrp', "Show looking for RP"), false, {
						className: 'common--formmargin ',
						onChange: v => this.module.charsAwake.toggleShowLfrp(v),
						popupTip: l10n.l('pageAwake.showLfrpInfo', "Filter the list to show characters currently set as looking for roleplay."),
						popupTipClassName: 'popuptip--width-s popuptip--position-left-bottom',
					})),
					n.elem('div', { className: 'pageawake--filter' }, [
						n.component('filter', new Input('', {
							className: 'margin-bottom-l',
							events: { input: c => this.module.charsAwake.setFilter(c.getValue()) },
							attributes: {
								placeholder: l10n.t('pageAwake.searchFilter', "Search filter"),
								spellcheck: 'false',
							},
						})),
						n.elem('clear', 'button', {
							className: 'pageawake--filter-clear iconbtn medium tinyicon',
							attributes: { type: 'button' },
							events: {
								click: (c, e) => {
									this.module.charsAwake.setFilter("");
									e.preventDefault();
								},
							},
						}, [
							n.component(new FAIcon('times')),
						]),
					]),
					n.elem('div', { className: 'pageawake--count' }, [
						n.component(new CollectionComponent(
							this.module.charsAwake.getCollection(),
							this.countCtx.fader,
							(col, c) => this._updateCount(),
						)),
					]),
					// Watched for characters
					n.component(new CollectionComponent(
						watchedAwake,
						new Collapser(),
						(col, c, ev) => c.setComponent(col.length
							? null
							: new Txt(l10n.l('pageAwake.nooneAwake', "Everyone watched is asleep"), { className: 'common--nolistplaceholder' }),
						),
					)),
					n.component(new CollectionList(watchedAwake, m => new PageAwakeChar(this.module, m, this._onCountChange), {
						className: 'pageawake--watched',
					})),
					n.component('hideuw', new LabelToggleBox(
						l10n.l('pageAwake.hideUnwatched', "Hide Unwatched"), false, {
						 className: 'pageawake--unwatched--hide',
						 onChange: v => this.module.charsAwake.setHideUnwatched(v),
							popupTip: l10n.l('pageAwake.hideUnwatchedInfo', "Toggle showing the online list of unwatched players."),
							popupTipClassName: 'popuptip--width-s popuptip--position-left-bottom',
					 })),
					// Non-watched for characters
					n.component(new ModelComponent(
						charsAwakeModel,
						new Collapser(),
						(m, c, ev) => {
							c.setComponent(
								m.hideuw
									? null
									: new CollectionList(unwatchedAwake, m => new PageAwakeChar(this.module, m, this._onCountChange), { className: 'pageawake--unwatched' }));
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
									: l10n.l('pageAwake.nooneAwake', "... and so is everyone else."),
								),
							),
						),
					)),
				])),
				(m, c, change) => {
					// Update show all togglebox
					c.getNode('show').setValue(m.showLfrp, false);
					// Set filter input value
					c.getNode('filter').setValue(m.filter, false);
					// set hide unwatched filter
					c.getNode('hideuw').setValue(m.hideuw, false);
					// Set clear button enabled/disabled
					c.setNodeProperty('clear', 'disabled', m.filter ? null : 'disabled');
					// Update count
					if (change && (change.hasOwnProperty('showLfrp') || change.hasOwnProperty('filter'))) {
						this._onCountChange();
					}
				},
			)),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, this.model.props);
			this.model = null;
			this.elem.unrender();
			this.elem = null;
			this._clearTimer(this.countCtx);
			this.countCtx = null;
		}
	}

	_onCountChange() {
		let ctx = this.countCtx;
		if (ctx && !ctx.timer) {
			// 100 millisecond delay on updating the count to prevent multiple
			// updates caused by a filter change.
			ctx.timer = setTimeout(() => this._updateCount(), 100);
		}
	}

	_clearTimer(ctx) {
		if (ctx.timer) {
			clearTimeout(ctx.timer);
			ctx.timer = null;
		}
	}

	_updateCount() {
		let ctx = this.countCtx;
		if (!ctx) return;

		this._clearTimer(ctx);
		let charsAwake = this.module.charsAwake;
		let total = charsAwake.getCollection().length;
		let filterIsEmpty = charsAwake.filterIsEmpty();
		let showLfrp = charsAwake.getModel().showLfrp;

		let str = null;
		let state = "";
		if (filterIsEmpty && !showLfrp) {
			state = 't';
			str = l10n.l('pageAwake.totalAwake', "{total} awake", { total });
		} else {
			state = 'moa';
			str = l10n.l('pageAwake.matchingOfTotalAwake', "Matching {matchCount} of {total} awake", { matchCount: countMatches(charsAwake.getCollection()), total });
		}

		// Determine if we should create a new Txt.
		// This is to make a nice fading transition between changing state.
		if (state != ctx.state) {
			ctx.state = state;
			ctx.txt = new Txt("", { duration: 0 });
		}

		let txtComp = ctx.txt;
		txtComp.setText(str);
		ctx.fader.setComponent(txtComp);
	}
}

export default PageAwakeComponent;
