import l10n from 'modapp-l10n';
import ModelFader from 'components/ModelFader';
import ErrorScreenDialog from 'components/ErrorScreenDialog';
import EditScriptComponent from './EditScriptComponent';

class EditScriptContainer {

	/**
	 * Initializes an EditScriptContainer
	 * @param {import('./EditScript').default["module"]} module EditScript modules.
	 * @param {import('./EditScript').default["model"]} model EditScript model.
	 */
	constructor(module, model) {
		this.module = module;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: (m) => m.roomScript,
				factory: (m) => new EditScriptComponent(this.module, m),
				hash: (m) => m.roomScript,
			},
			{
				factory: (m) => new ErrorScreenDialog(m.error, {
					titleTxt: m.error
						? l10n.l('editScript.errorFetchingScript', "Error fetching script")
						: l10n.l('editScript.noScript', "Hello there"),
					infoTxt: m.error
						? l10n.l('editScript.errorFetchingScriptInfo', "An error occurred when fetching the script:")
						: l10n.l('editScript.noScriptInfo', "Did you mean to edit a script? There are no scripts here."),
					buttonTxt: window.opener
						? l10n.l('editScript.close', "Close window")
						: l10n.l('editScript.goBack', "Go back"),
					onClose: () => {
						if (window.opener) {
							window.opener.focus();
							window.close();
						} else {
							window.location.assign('/');
						}
					},
				}),
				hash: (m) => m.error,
			},
		], {
			className: 'editscript-container',
		});
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default EditScriptContainer;
