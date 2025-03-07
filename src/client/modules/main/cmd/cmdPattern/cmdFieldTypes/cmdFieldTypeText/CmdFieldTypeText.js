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
				let len = str.length;
				if (opts.trimSpace) {
					str = str.trimStart();
				}
				let from = len - str.length;
				let to = from + Math.min(str.length, opts.maxLength || this.module.info.getTag().tagDescMaxLength);
				return { from, to, partial: false };
			},
			stepFactory: (fieldKey, opts) => new TextStep([ 'fields', fieldKey ], {
				name: fieldKey,
				spanLines: !!opts?.spanLines,
				spellcheck: !!opts?.spellCheck,
				formatText: !!opts?.formatText,
				trimSpace: !!opts?.trimSpace,
				maxLength: opts.maxLength || (() => this.module.info.getTag().tagDescMaxLength),
				errTooLong: textTooLong,
				errRequired: null,
			}),
			inputValue: (fieldKey, opts, params) => {
				return {
					value: params.fields[fieldKey],
				};
			},
		});
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('text');
	}
}

export default CmdFieldTypeText;
