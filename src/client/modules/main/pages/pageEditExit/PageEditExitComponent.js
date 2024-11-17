import { Elem, Txt, Input, Textarea, Context } from 'modapp-base-component';
import { ModelComponent, ModelTxt, CollectionList } from 'modapp-resource-component';
import { ModifyModel, Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
import LabelToggleBox from 'components/LabelToggleBox';
import ExitIcon from 'components/ExitIcon';
import NavButtons, { directions } from 'components/NavButtons';
import ModelCollapser from 'components/ModelCollapser';
import prepareKeys from 'utils/prepareKeys';

/**
 * PageEditExitComponent renders a room exit edit page.
 */
class PageEditExitComponent {
	constructor(module, ctrl, room, exitId, model, state, close) {
		state.model = state.model || {};
		state.exit = state.exit || {};
		state.exitInfo = state.exitInfo || {};

		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.exitId = exitId;
		this.model = model;
		this.state = state;
		this.close = close;
		this._message = new Collapser();
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new Fader(null),
			(m, c, change) => {
				if (change && !change.hasOwnProperty('exit')) return;
				this._setComponent(c, m.exit);
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_setComponent(c, exit) {
		if (!exit) {
			c.setComponent(null);
			return;
		}
		c.setComponent(new Context(
			() => ({
				model: new Model({
					data: { keys: this.state.hasOwnProperty('keys') ? this.state.keys : exit.keys.join(", ") },
					eventBus: this.module.self.app.eventbus,
				}),
				exit: new ModifyModel(exit, {
					props: this.state.exit,
					eventBus: this.module.self.app.eventBus,
				}),
			}),
			ctx => {
				this.state.exit = ctx.exit.getModifications() || {};
				ctx.exit.dispose();
			},
			ctx => new Elem(n => n.elem('div', { className: 'pageeditexit' }, [
				n.component(new PanelSection(
					l10n.l('pageEditExit.originRoom', "Origin"),
					new ModelTxt(this.room, m => m.name),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditExit.targetRoom', "Destination"),
					new ModelTxt(exit.targetRoom, m => m.name),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditExit.exitName', "Exit name"),
					new ModelComponent(
						ctx.exit,
						new Input(ctx.exit.name, {
							events: { input: c => ctx.exit.set({ name: c.getValue() }) },
							attributes: { spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.name),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditExit.exitName', "Keywords"),
					new Input(ctx.model.keys, {
						events: { input: c => ctx.model.set({ keys: c.getValue() }) },
						attributes: { spellcheck: 'false' },
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditExit.keysInfo', "Comma-separated list of case-insensitive keywords used for identifying the exit."),
					},
				)),
				n.elem('div', { className: 'flex-row pad8 common--sectionpadding' }, [
					n.component(new PanelSection(
						l10n.l('pageEditExit.navigation', "Navigation"),
						new ModelComponent(
							ctx.exit,
							new NavButtons(null, {
								onClick: (dir) => ctx.exit.set({ nav: ctx.exit.nav == dir ? '' : dir }),
							}),
							(m, c, change) => {
								if (!change || change.hasOwnProperty('nav')) {
									c.setState(this._getNavState(m.nav));
								}
							},
						),
						{
							className: 'flex-1',
							noToggle: true,
						},
					)),
					n.component(new PanelSection(
						l10n.l('pageEditExit.icon', "Icon"),
						new Elem(n => n.elem('div', { className: 'flex-row' }, [
							n.component(this._newIconSet(ctx.exit, [
								[ 'nw', 'n', 'ne' ],
								[ 'w', '', 'e' ],
								[ 'sw', 's', 'se' ],
							], {
								className: 'pageeditexit--dir-icons flex-auto',
							})),
							n.component(this._newIconSet(ctx.exit, [
								[ 'in', 'out' ],
								[ 'up', 'down' ],
							], {
								className: 'pageeditexit--misc-icons flex-1',
							})),
						])),
						{
							className: 'flex-1',
							noToggle: true,
						},
					)),
				]),
				n.component(new PanelSection(
					l10n.l('pageEditExit.leaveMessage', "Leave message"),
					new ModelComponent(
						ctx.exit,
						new Textarea(ctx.exit.leaveMsg, {
							className: 'common--paneltextarea-small',
							events: { input: c => ctx.exit.set({ leaveMsg: c.getValue() }) },
						}),
						(m, c) => c.setValue(m.leaveMsg),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditExit.leaveMessageInfo', "Message seen by the origin room. Usually starts with \"leaves ...\"."),
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditExit.arriveMessage', "Arrival message"),
					new ModelComponent(
						ctx.exit,
						new Textarea(ctx.exit.arriveMsg, {
							className: 'common--paneltextarea-small',
							events: { input: c => ctx.exit.set({ arriveMsg: c.getValue() }) },
						}),
						(m, c) => c.setValue(m.arriveMsg),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditExit.arriveMessageInfo', "Message seen by the arrival room. Usually starts with \"arrives from ...\"."),
					},
				)),
				n.component(new PanelSection(
					l10n.l('pageEditExit.travelMessage', "Travel message"),
					new ModelComponent(
						ctx.exit,
						new Textarea(ctx.exit.travelMsg, {
							className: 'common--paneltextarea-small',
							events: { input: c => ctx.exit.set({ travelMsg: c.getValue() }) },
						}),
						(m, c) => c.setValue(m.travelMsg),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('pageEditExit.travelMessageInfo', "Message seen by the exit user. Usually starts with \"goes ...\"."),
					},
				)),
				n.elem('div', { className: 'pageeditexit--flags' }, [
					n.component(new ModelComponent(
						ctx.exit,
						new LabelToggleBox(l10n.l('pageEditExit.isInactive', "Is inactive"), false, {
							className: 'common--formmargin',
							onChange: v => ctx.exit.set({ inactive: v }),
							popupTip: l10n.l('pageEditExit.activeInfo', "An inactive exit is not listed, and may not be used. Room scripts may still redirect to the exit."),
						}),
						(m, c) => c.setValue(m.inactive, false),
					)),
				]),
				n.elem('div', { className: 'pageeditexit--flags' }, [
					n.component(new ModelComponent(
						ctx.exit,
						new LabelToggleBox(l10n.l('pageEditExit.isHidden', "Is hidden"), false, {
							className: 'common--formmargin',
							onChange: v => ctx.exit.set({ hidden: v }),
							popupTip: l10n.l('pageEditExit.hiddenInfo', "A hidden exit is not listed among room exits, but characters may still use it if they know the keyword(s)."),
						}),
						(m, c) => c.setValue(m.hidden, false),
					)),
					n.component(new ModelCollapser(ctx.exit, [{
						condition: m => !m.hidden,
						component: new ModelComponent(
							ctx.exit,
							new LabelToggleBox(l10n.l('pageEditExit.isTransparent', "Is transparent"), false, {
								className: 'pad-bottom-l',
								onChange: v => ctx.exit.set({ transparent: v }),
								popupTip: l10n.l('pageEditExit.transparentInfo', "A transparent exit allows you to see what characters are awake in the target room."),
							}),
							(m, c) => c.setValue(m.transparent, false),
						),
					}])),
				]),
				n.component(this._message),
				n.elem('div', { className: 'pad-top-xl flex-row margin8 flex-end' }, [
					n.elem('div', { className: 'flex-1' }, [
						n.component(new ModelComponent(
							ctx.model,
							new ModelComponent(
								ctx.exit,
								new Elem(n => n.elem('update', 'button', { events: {
									click: () => this._save(ctx),
								}, className: 'btn primary common--btnwidth' }, [
									n.component('text', new Txt()),
								])),
								(m, c) => this._setSaveText(ctx, c),
							),
							(m, c) => this._setSaveText(ctx, c.getComponent()),
						)),
					]),
					n.elem('button', { events: {
						click: () => this.module.confirm.open(() => this._delete(), {
							title: l10n.l('pageEditExit.confirmDelete', "Confirm deletion"),
							body: l10n.l('pageEditExit.deleteExitBody', "Do you really wish to delete this exit?"),
							confirm: l10n.l('pageEditExit.delete', "Delete"),
						}),
					}, className: 'iconbtn medium' }, [
						n.component(new FAIcon('trash')),
					]),
				]),
			])),
		));
	}

	_newIconSet(model, set, opt) {
		return new CollectionList(set, row => new CollectionList(
			row,
			icon => new ModelComponent(
				model,
				new Elem(n => n.elem('div', { className: 'pageeditexit--icon' }, [
					n.elem('btn', 'button', {
						className: 'iconbtn tiny tinyicon',
						attributes: icon ? null : { disabled: '' },
						events: {
							click: (e, ev) => {
								model.set({ icon: model.icon == icon ? '' : icon });
								ev.stopPropagation();
							},
						},
					}, [
						n.component(new ExitIcon(icon)),
					]),
				])),
				(m, c) => c[icon && model.icon == icon ? 'addNodeClass' : 'removeNodeClass']('btn', 'active'),
			),
			{
				className: 'pageeditexit--icon-row flex-row',
				horizontal: true,
			},
		), opt);
	}

	_getNavState(nav) {
		return directions.reduce((state, dir) => (state[dir] = {
			selected: dir == nav,
		}, state), {});
	}

	_setSaveText(ctx, c) {
		c.getNode('text').setText(this._getModifications(ctx)
			? l10n.l('pageEditExit.update', "Save edits")
			: l10n.l('pageEditExit.close', "Close"),
		);
	}

	_getModifications(ctx) {
		let mods = ctx.exit.getModifications() || {};
		if (mods && ctx.exit.hidden) {
			delete mods.transparent;
		}
		let keys = prepareKeys(ctx.model.keys);
		if (!this._equalKeys(keys, ctx.exit.keys)) {
			mods.keys = keys;
		}
		return Object.keys(mods).length ? mods : null;
	}

	/**
	 * Tests if two arrays of key strings are equal.
	 * @param {Array.<string>} a Array of strings.
	 * @param {Array.<string>} b Array of strings.
	 * @returns {boolean} True if equal, otherwise false.
	 */
	_equalKeys(a, b) {
		let l = a.length;
		if (l !== b.length) return false;
		for (let i = 0; i < l; i++) {
			if (a[i] !== b[i]) return false;
		}
		return true;
	}

	_save(ctx) {
		let p;
		let params = this._getModifications(ctx);
		if (params) {
			params.exitId = this.exitId;
			p = this.ctrl.call('setExit', params);
		} else {
			p = Promise.resolve();
		}

		return p.then(() => {
			this._close();
		}).catch(err => {
			this._setMessage(l10n.l(err.code, err.message, err.data));
		});
	}

	_setMessage(msg) {
		this._message.setComponent(msg
			? new Txt(msg, { className: 'dialog--error' })
			: null,
		);
	}

	_delete() {
		this.module.deleteExit.deleteExit(this.ctrl, { exitId: this.exitId })
			.catch(err => this._setMessage(l10n.l(err.code, err.message, err.data)));
	}

	_close() {
		this.close();
	}
}

export default PageEditExitComponent;
