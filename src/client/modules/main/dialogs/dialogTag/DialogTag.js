import { Elem, Txt, Textarea, Context } from 'modapp-base-component';
import { ModelComponent, CollectionList, ModelTxt } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Dialog from 'classes/Dialog';
import Collapser from 'components/Collapser';
import LabelToggleBox from 'components/LabelToggleBox';
import PanelSection from 'components/PanelSection';
import './dialogTag.scss';


class DialogTag {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onClose = this._onClose.bind(this);
		this._onSubmit = this._onSubmit.bind(this);

		this.app.require([ 'api', 'tags' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Opens a dialog to add a new tag to a character.
	 * @param {Model} ctrl Controlled character.
	 * @param {string|Model} tag Tag key or add, or tag Model to edit.
	 * @param {object} opt Optional parameters.
	 * @param {string} pref Preference id. May be 'like' or 'dislike'. Defaults to 'like'.
	 */
	open(ctrl, tag, opt) {
		if (this.dialog) return;

		opt = opt || {};
		let isEdit = typeof tag != 'string';
		let prefs = this.module.tags.getPreferences();
		let key = isEdit ? tag.key : tag.trim().toLowerCase();
		let global = this.module.tags.getTag(key);
		let props = {
			pref: opt.pref || prefs[0].id,
			custom: !global || (isEdit && tag.id != global.id),
		};
		let isRoleTag = global && (global.role || global.idRole);

		this.dialog = new Dialog({
			title: isRoleTag
				? l10n.l('dialogTag.titleTag', "Title tag")
				: isEdit
					? l10n.l('dialogTag.editTag', "Edit tag")
					: l10n.l('dialogTag.addTag', "Add tag"),
			className: 'dialogtag',
			content: new Context(
				() => new ModifyModel(isEdit ? tag : (global || { key, desc: '' }), {
					props,
					modifiedOnNew: true,
					eventBus: this.app.eventBus,
				}),
				model => model.dispose(),
				model => new Elem(n => n.elem('div', [
					n.elem('div', { className: 'common--itemtitle common--sectionpadding' }, [ n.text(key) ]),
					n.component('desc', new PanelSection(
						l10n.l('pageAddTag.description', "Description"),
						new Elem(n => n.elem('div', [
							n.component('desc', new ModelComponent(
								global,
								new ModelComponent(
									model,
									new Textarea(model.desc, {
										className: 'dialogtag--desc dialog--input common--paneltextarea-small common--desc-size',
										events: {
											input: c => {
												let v = c.getValue().replace(/\r?\n/gi, '');
												c.setValue(v);
												model.set({ desc: v });
											},
										},
										attributes: { name: 'dialogtag-desc', spellcheck: 'true' },
									}),
									(m, c) => {
										c.setValue(m.custom ? m.desc : global.desc);
										c.setProperty('disabled', m.custom ? null : 'disabled');
									},
								),
								(m, c) => {
									if (m && !model.custom) {
										c.getComponent().setValue(m.desc);
									}
								},
							)),
							n.component(global && !isRoleTag ? new LabelToggleBox(l10n.l('dialogTag.customDescription', "Custom description"), !!model.custom, {
								className: 'pad-top-l',
								onChange: v => model.set({ custom: v }),
							}) : null),
						])),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					)),
					n.component(isRoleTag ? null : new PanelSection(
						l10n.l('pageAddTag.preference', "Preference"),
						new CollectionList(
							prefs,
							p => new ModelComponent(
								model,
								new LabelToggleBox(p.name, model.pref == p.id, {
									className: 'dialogtag--pref-' + p.id,
									events: {
										click: (c, e) => {
											model.set({ pref: p.id });
											e.stopPropagation();
										},
									},
									disableClick: true,
								}),
								(m, c) => c.setValue(m.pref == p.id, false),
							),
							{
								className: 'pad-top-s flex-row pad16',
								horizontal: true,
							},
						),
						{
							className: 'common--sectionpadding',
							noToggle: true,
						},
					)),
					n.component('message', new Collapser(null)),
					n.elem('div', { className: 'pad-top-xl' }, [
						n.elem('add', 'button', {
							events: { click: () => this._onSubmit(ctrl, model, isEdit, global) },
							className: 'dialogtag--btn btn primary common--btnwidth',
						}, [
							n.component(isEdit
								? new ModelTxt(model, m => (m.getModel().desc != m.desc && m.custom) || props.custom != m.custom || props.pref != m.pref
									? l10n.l('dialogTag.update', "Update")
									: l10n.l('dialogTag.close', "Close"),
								)
								: new Txt(l10n.l('dialogTag.addTag', "Add tag")),
							),
						]),
					]),
				])),
			),
			onClose: this._onClose,
		});

		this.dialog.open();
		// Focus depends on if it is a custom tag
		let c = this.dialog.getContent().getComponent();
		if (props.custom) {
			c.getNode('desc').getComponent().getNode('desc').getComponent().getComponent().getElement().focus();
		} else {
			c.getNode('add').focus();
		}
	}

	_onClose() {
		this.dialog = null;
	}

	_onSubmit(ctrl, model, isEdit, global) {
		if (this.submitPromise) return this.submitPromise;

		let mods = model.getModifications();
		let promise = Promise.resolve();

		if (isEdit) {
			if (mods.hasOwnProperty('custom')) {
				if (model.custom) {
					// Change from global to custom
					promise = this._callSetPref(ctrl, model.id, null)
						.then(() => this._callCreate(ctrl, model));
				} else if (global) {
					// Change from custom to global
					promise = this._callSetPref(ctrl, model.id, null)
						.then(() => this._callSetPref(ctrl, global.id, model.pref));
				} else {
					promise = Promise.reject({ code: 'dialogTag.noGlobalTag', message: "There is no global tag [{tag}]", data: { tag: model.key }});
				}
			} else {
				// Updating preference
				promise = this._callSetPref(ctrl, model.id, model.pref);
				if (model.custom && mods.hasOwnProperty('desc')) {
					// Updating description for custom tags.
					promise = promise.then(() => this._callSetDesc(model.id, model.desc));
				}
			}
		} else {
			promise = model.custom
				? this._callCreate(ctrl, model)
				: this._callSetPref(ctrl, global.id, model.pref);
		}

		promise.then(() => {
			if (this.dialog) {
				this.dialog.close();
			}
		}).catch(err => {
			if (!this.dialog) return;
			this._setMessage(l10n.l(err.code, err.message, err.data));
		}).then(() => {
			this.submitPromise = null;
		});

		return this.submitPromise;
	}

	_callCreate(ctrl, model) {
		return this.module.api.call('tag.char.' + ctrl.id + '.tags', 'create', {
			key: model.key,
			desc: model.desc,
			pref: model.pref,
		});
	}

	_callSetPref(ctrl, tagId, pref) {
		return this.module.api.call('tag.char.' + ctrl.id + '.tags', 'setTags', { tags: { [ tagId ]: pref }});
	}

	_callSetDesc(tagId, desc) {
		return this.module.api.call('tag.tag.' + tagId, 'set', { desc });
	}


	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getComponent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}
}

export default DialogTag;
