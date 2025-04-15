import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
// import { CollectionWrapper } from 'modapp-resource';

/**
 * ScriptEditorComponent renders the script editor.
 */
class ScriptEditorComponent {

	constructor(module, model, user) {
		this.module = module;
		this.model = model;
		this.user = user;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'scripteditor' }, [
			n.elem('div', { className: 'scripteditor--header' }, [
				// n.component(new Context(
				// 	() => new CollectionWrapper(this.module.self.getTools(), {
				// 		filter: t => !t.type || t.type == 'header' && (t.filter ? t.filter() : true),
				// 	}),
				// 	tools => tools.dispose(),
				// 	tools => new CollectionList(
				// 		tools,
				// 		t => t.componentFactory(),
				// 		{
				// 			className: 'scripteditor--headertools',
				// 			subClassName: t => t.className || null,
				// 			horizontal: true,
				// 		},
				// 	),
				// )),
				n.elem('div', { className: 'scripteditor--headercontent' }, [
					// Title
					n.component(new Txt("Script editor", { tagName: 'h2', className: 'scripteditor--headertitle' })),

					// Buttons
					n.elem('div', { className: 'scripteditor--headerbuttons' }, [
						n.elem('button', {
							events: { click: () => this._onSave() },
							className: 'btn primary scripteditor--save',
						}, [
							n.component(new ModelTxt(this.model, m => m.isModified
								? l10n.l('scriptEditor.saveChanges', "Save changes")
								: l10n.l('scriptEditor.close', "Close"),
							)),
						]),
					]),
				]),


				// n.component(new Context(
				// 	() => new CollectionWrapper(this.module.self.getTools(), {
				// 		filter: t => !t.type || t.type == 'logo' && (t.filter ? t.filter() : true),
				// 	}),
				// 	tools => tools.dispose(),
				// 	tools => new CollectionList(
				// 		tools,
				// 		t => t.componentFactory(),
				// 		{
				// 			className: 'scripteditor--logotools flex-1 flex-row sm',
				// 			subClassName: t => t.className || null,
				// 			horizontal: true,
				// 		},
				// 	),
				// )),
			]),
			n.elem('div', { className: 'scripteditor--main' }, [
				n.component(new Txt("Script code")),
			]),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onSave() {
		console.error("not implemented");
	}
}

export default ScriptEditorComponent;
