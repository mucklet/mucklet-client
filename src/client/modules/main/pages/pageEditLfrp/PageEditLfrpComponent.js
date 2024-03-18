import { Elem, Txt, Textarea, Context } from 'modapp-base-component';
import { ModelComponent, CollectionList } from 'modapp-resource-component';
import { ModifyModel, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';

const txtLfrpInfo = l10n.l('pageEditLfrp.lfrpInfo', "When set as looking for roleplay, it helps other players find you.");
const txtLfrpDescInfo = l10n.l('pageEditLfrp.lfrpDescInfo', "Use the description for in-character roleplay setup, out-of-character info on what type of roleplay you seek, or directions on where to find you. It may be formatted and span multiple paragraphs.");

class PageEditLfrpComponent {
	constructor(module, ctrl, settings, state, close) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.settings = settings;
		this.state = state;
		this.close = close;
	}

	render(el) {
		this.model = new ModifyModel(this.settings, {
			props: this.state.changes,
			eventBus: this.module.self.app.eventBus,
		});
		this.elem = new Elem(n => n.elem('div', { className: 'pageeditlfrp' }, [

			n.component(new Txt(txtLfrpInfo, { className: 'pageeditlfrp--info' })),
			n.component(new PanelSection(
				l10n.l('pageEditLfrp.roleplyDesc', "Roleplay description"),
				new ModelComponent(
					this.model,
					new Textarea(this.model.lfrpDesc, {
						className: 'common--paneltextarea common--desc-size',
						events: { input: c => this.model.set({ lfrpDesc: c.getValue() }) },
						attributes: { name: 'editlfrp-lfrp', spellcheck: 'true' },
					}),
					(m, c) => c.setValue(m.lfrpDesc),
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: txtLfrpDescInfo,
					popupTipClassName: 'popuptip--width-m popuptip--position-left-bottom',
				},
			)),
			n.component(new Context(
				() => new CollectionWrapper(this.module.self.getTools(), {
					filter: t => (!t.type || t.type == 'section') && (t.filter ? t.filter(this.ctrl) : true),
				}),
				tools => tools.dispose(),
				tools => new CollectionList(
					tools,
					t => t.componentFactory(this.ctrl, this.state),
					{
						className: 'pageeditlfrp--sections',
						subClassName: t => t.className || null,
					},
				),
			)),
			n.component('message', new Collapser(null)),
			n.elem('div', { className: 'pad-top-xl flex-row margin16' }, [

				n.elem('button', { events: {
					click: () => this._save('lfrp'),
				}, className: 'btn primary common--btnwidth flex-1' }, [
					n.component('btnConfirm', new Txt()),
				]),

				n.elem('button', { events: {
					click: () => this._save(''),
				}, className: 'btn secondary common--btnwidth flex-1' }, [
					n.component('btnCancel', new Txt()),
				]),
			]),
		]));
		this.wrapper = new ModelComponent(
			this.ctrl,
			new ModelComponent(
				this.model,
				this.elem,
				(m, c) => this._setButtons(),
			),
			(m, c) => this._setButtons(),
		);
		return this.wrapper.render(el);
	}

	unrender() {
		if (this.wrapper) {
			this.wrapper.unrender();
			this.wrapper = null;
			this.elem = null;
		}
		if (this.model) {
			this.state.changes = this.model.getModifications() || {};
			this.model.dispose();
			this.model = null;
		}
	}

	_save(rpState) {
		let change = this.model && this._getChanges();

		// Start with a promise to remove LFRP state if that is what we are
		// doing. We do things in this order so that we don't get two events
		// following eachother.
		return (rpState !== this.ctrl.rp && rpState != 'lfrp'
			? this.ctrl.call('set', { rp: rpState })
			: Promise.resolve()
		)
			// Continue with a promise to update lfrpDesc if we've changed it
			.then(() => (change && Object.keys(change).length
				? this.module.player.getPlayer().call('setCharSettings', Object.assign({
					charId: this.ctrl.id,
					puppeteerId: this.ctrl.puppeteer?.id || undefined,
				}, change))
				: Promise.resolve()
			))
			// Continue to set LFRP state if that is what we are doing
			.then(() => (rpState !== this.ctrl.rp && rpState == 'lfrp'
				? this.ctrl.call('set', { rp: rpState })
				: Promise.resolve()
			))
			.then(() => {
				this._close();
			})
			.catch(err => {
				this._setMessage(l10n.l(err.code, err.message, err.data));
			});
	}

	_getChanges() {
		if (!this.model) return {};

		return Object.assign({}, this.model.getModifications());
	}

	_setMessage(msg) {
		if (!this.elem) return;
		this.elem.getNode('message').setComponent(msg
			? new Txt(msg, { className: 'dialog--error' })
			: null,
		);
	}

	_close() {
		this.close();
		if (this.model) {
			this.model.dispose();
			this.model = null;
		}
		this.state.changes = {};
	}

	_setButtons() {
		if (!this.elem) return;

		let hasChange = Object.keys(this._getChanges()).length;
		let isLfrp = this.ctrl.rp == 'lfrp';

		this.elem.getNode('btnConfirm').setText(isLfrp
			? hasChange
				? l10n.l('pageEditLfrp.update', "Save edits")
				: l10n.l('pageEditLfrp.close', "Close")
			: l10n.l('pageEditLfrp.activate', "Start LFRP"),
		);
		this.elem.getNode('btnCancel').setText(isLfrp
			? l10n.l('pageEditLfrp.deactivate', "Stop LFRP")
			: hasChange
				? l10n.l('pageEditLfrp.update', "Save edits")
				: l10n.l('pageEditLfrp.close', "Close"),
		);
	}
}

export default PageEditLfrpComponent;
