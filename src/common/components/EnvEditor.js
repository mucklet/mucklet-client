import { Elem, Txt, Context, Input } from 'modapp-base-component';
import { ModelToCollection, Model } from 'modapp-resource';
import { ModelComponent, CollectionList } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import NestedModel from 'classes/NestedModel';
import Dialog from 'classes/Dialog';
import PanelSection from 'components/PanelSection';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import './envEditor.scss';

/**
 * EnvEditor is an editor for environment variables, where it list of badges for
 * each model key, and makes the values editable.
 */
class EnvEditor {
	constructor(model, opt) {
		this.model = model;
		this.opt = opt;
	}

	render(el) {
		this.elem = new Context(
			() => new ModelToCollection(new NestedModel(
				this.model,
				(m) => Object.keys(m.props || {}).reduce((o, key) => {
					return Object.assign(o, { [key]: key });
				}, {}) || {},
				{
					maxDepth: 1, // Listen to model only
				},
			), {
				compare: (a, b) => a.key.localeCompare(b.key),
			}),
			(collection) => collection.dispose(),
			(collection) => new Elem(n => n.elem('div', this.opt, [
				n.component(new CollectionList(
					collection,
					key => new Elem(n => n.elem('div', { className: 'enveditor badge large dark' }, [
						n.elem('div', { className: 'flex-row' }, [
							n.component(new Txt(key, { tagName: 'div', className: 'badge--title flex-1' })),
							n.elem('button', {
								className: 'iconbtn puny lighten flex-auto',
								events: {
									click: (el, e) => {
										this.model.set({ [key]: undefined });
										e.stopPropagation();
									},
								},
							}, [
								n.component(new FAIcon('times')),
							]),
						]),
						n.elem('div', { className: 'badge--margin' }, [
							n.component(new ModelComponent(
								this.model,
								new Input("", {
									className: 'enveditor--value',
									events: {
										input: c => this.model.set({ [key]: c.getValue() }),
									},
									attributes: {
										name: 'env-' + key,
										spellcheck: 'false',
									},
								}),
								(m, c) => {
									// Only change the value if the key exists.
									// This prevents it to say "undefined" when
									// deleting it.
									if (m.props.hasOwnProperty(key)) {
										c.setValue(m.props[key]);
									}
								},
							)),
						]),
					])),
					{
						subClassName: () => 'enveditor--env',
					},
				)),

				// Add new
				n.elem('div', { className: 'enveditor--create' }, [
					n.elem('add', 'button', { events: { click: () => this._onCreate() }, className: 'btn small icon-left' }, [
						n.component(new FAIcon('plus')),
						n.component(new Txt(l10n.l('envEditor.createNew', "Create new"))),
					]),
				]),
			])),
		);
		return this.elem.render(el);
	}

	_onCreate() {
		let model = new Model({ data: { key: '', value: '' }});
		let message = new Collapser(null);
		let setMessage = (txt) => message.setComponent(txt ? new Txt(txt, { className: 'dialog--error' }) : null);
		let dialog = new Dialog({
			title: l10n.l('envEditor.createNewRoomScript', "Create new variable"),
			className: 'enveditor--dialog',
			content: new Elem(n => n.elem('div', [
				// Name
				n.component(new PanelSection(
					l10n.l('envEditor.name', "Name"),
					new Input(model.key, {
						events: { input: c => model.set({ key: c.getValue() }) },
						attributes: { spellcheck: 'false' },
						className: 'dialog--input',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				// Value
				n.component(new PanelSection(
					l10n.l('envEditor.value', "Value"),
					new Input(model.value, {
						events: { input: c => model.set({ value: c.getValue() }) },
						attributes: { spellcheck: 'false' },
						className: 'dialog--input',
					}),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				)),
				// Message
				n.component(message),
				// Footer
				n.elem('div', { className: 'pad-top-xl' }, [
					n.elem('create', 'button', {
						events: {
							click: () => {
								let key = model.key.trim();
								if (!model.key) {
									return setMessage(l10n.l('envEditor.missingName', "Name is required."));
								}
								if (this.model.props.hasOwnProperty(key)) {
									return setMessage(l10n.l('envEditor.nameAlreadyExists', "Name already exists."));
								}
								this.model.set({ [key]: model.value });
								dialog.close();
							},
						},
						className: 'btn primary dialog--btn',
					}, [
						n.component(new Txt(l10n.l('envEditor.create', "Create"))),
					]),
				]),
			])),
		});
		dialog.open();
	}

	unrender() {
		this.elem?.unrender();
		this.elem = null;
	}
}

export default EnvEditor;
