import TextStep from 'classes/TextStep';
import { keyRegex } from 'utils/regex';
import { keyTooLong } from 'utils/cmdErr';

/**
 * CmdFieldTypeKeyword registers the "keyword" field type for custom commands.
 */
class CmdFieldTypeKeyword {
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
			id: 'keyword',
			match: (str, opts) => {
				let len = str.length;
				str = str.trimStart();
				let from = len - str.length;
				let m = str.match(keyRegex);
				if (!m || !m[0].length) {
					return null;
				}
				let to = from + Math.min(m[0].length, opts.maxLength || this.module.info.getCore().keyMaxLength);
				return { from, to, partial: false };
			},
			stepFactory: (fieldKey, opts) => new TextStep([ 'fields', fieldKey ], {
				name: fieldKey,
				regex: keyRegex,
				spellcheck: false,
				maxLength: opts.maxLength || (() => this.module.info.getCore().keyMaxLength),
				errTooLong: keyTooLong,
			}),
			inputValue: (fieldKey, opts, params) => {
				return {
					value: params.fields[fieldKey],
				};
			},
		});
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('keyword');
	}
}

export default CmdFieldTypeKeyword;
