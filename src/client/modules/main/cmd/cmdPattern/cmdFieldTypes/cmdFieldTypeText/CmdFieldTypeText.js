import Err from 'classes/Err';
// import TextStep from 'classes/TextStep';
// import { textTooLong } from 'utils/cmdErr';

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
		/**
		 * @type {{
		 * 	cmdPattern: import('modules/main/cmd/cmdPattern/CmdPattern').default
		 * 	info: import('modules/main/addons/info/Info').default
		 * }}
		 */
		this.module = module;
		this.module.cmdPattern.addFieldType({
			id: 'text',
			match: (fieldKey, str, opts, tokens, prevValue) => {
				let len = str.length;
				// Remove leading spacing for first line
				if (!prevValue) {
					str = str.trimStart();
				}
				let from = len - str.length;
				// Remove trailing space
				str = str.trimEnd();

				let maxLength = opts.maxLength || this.module.info.getCore().descriptionMaxLength;
				let allowedLen = Math.max(0, maxLength - (prevValue ? prevValue.value.length + 1 /** new line */ : 0));
				// Add tokens
				if (tokens) {
					// Did we consume space. Add a null token.
					if (from > 0) {
						tokens.push({ token: null, n: from });
					}
					// Did we match any other token
					if (str.length) {
						// Add text token for matched string
						if (allowedLen > 0) {
							tokens.push({ token: 'text', n: Math.min(str.length, allowedLen) });
						}
						// Add error token for string exceeding allowed length
						if (allowedLen < str.length) {
							tokens.push({ token: 'error', n: str.length - allowedLen });
						}
					}
					// Add token for trailing space
					if ((len - from - str.length) > 0) {
						tokens.push({ token: null, n: (len - from - str.length) });
					}
				}
				// Create value. If we had a previous value, append to that result.
				let value = {
					value: allowedLen > 0
						? (prevValue ? prevValue.value + "\n" : '') + str.slice(0, allowedLen)
						: (prevValue ? prevValue.value : ''),
				};
				return {
					from,
					to: len,
					partial: false,
					more: opts.spanLines,
					value,
					error: str.length > allowedLen
						? new Err('cmdFieldTypeText.exceedsMaxLength', '{fieldKey} exceeds max length of {maxLength} characters.', { fieldKey, maxLength })
						: null,
				};
			},
			formatText: (opts) => {
				return opts.formatText
					? {}
					: null;
			},
		});
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('text');
	}
}

export default CmdFieldTypeText;
