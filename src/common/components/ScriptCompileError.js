import { RootElem } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import errToL10n from 'utils/errToL10n';
import './scriptCompileError.scss';

/**
 * ScriptCompileError shows a compile error to use in char log.
 */
class ScriptCompileError extends RootElem {

	/**
	 * Creates an instance of ScriptCompileError
	 * @param {Err} err Compile error..
	 */
	constructor(err) {
		super(n => n.elem('div', { className: 'scriptcompileerror' }, [
			n.elem('div', [
				n.text(l10n.t('scriptCompileError.compileError', "Script compile error")),
			]),
			n.elem('div', { className: 'common--pre-wrap scriptcompileerror--msg' }, [
				n.text(l10n.t(errToL10n(err))),
			]),
		]));
	}
}

export default ScriptCompileError;
