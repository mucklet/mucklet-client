import TextStep from 'classes/TextStep';
import { textTooLong } from 'utils/cmdErr';

/**
 * CmdFieldTypeText registers the "text" field type for custom commands.
 */
class CmdFieldTypeText {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmdPattern',
			'info',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmdPattern.addFieldType({
			id: 'text',
			match: (str, opts) => {
				if (opts.trimSpace) {
					str = str.trimStart();
				}
				// Only consume maxLength characters.
				return str.slice(opts.maxLength || this.module.info.getTag().tagDescMaxLength);
			},
			stepFactory: (fieldKey, opts) => new TextStep('msg', {
				spanLines: !!opts?.spanLines,
				spellcheck: !!opts?.spellCheck,
				formatText: !!opts?.formatText,
				trimSpace: !!opts?.trimSpace,
				maxLength: opts.maxLength || (() => this.module.info.getTag().tagDescMaxLength),
				errTooLong: textTooLong,
				errRequired: null,
			}),
		});
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('text');
	}
}

export default CmdFieldTypeText;
