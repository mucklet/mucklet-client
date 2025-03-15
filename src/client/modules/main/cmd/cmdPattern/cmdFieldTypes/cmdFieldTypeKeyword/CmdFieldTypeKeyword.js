import { keyRegex } from 'utils/regex';
import Err from 'classes/Err';

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
		/**
		 * @type {{
		 * 	cmdPattern: import('modules/main/cmd/cmdPattern/CmdPattern').default
		 * 	info: import('modules/main/addons/info/Info').default
		 * }}
		 */
		this.module = module;
		this.module.cmdPattern.addFieldType({
			id: 'keyword',
			match: (fieldKey, str, opts, tokens, prevValue) => {
				let len = str.length;
				str = str.trimStart();
				let from = len - str.length;
				let m = str.match(keyRegex);
				let mlen = m ? m[0].length : 0;
				if (!mlen) {
					return null;
				}
				let maxLength = opts.maxLength || this.module.info.getCore().keyMaxLength;
				let allowedLen = Math.max(0, maxLength);
				let to = from + mlen;
				// Add tokens
				if (tokens) {
					// Did we consume space. Add a null token.
					if (from > 0) {
						tokens.push({ token: null, n: from });
					}
					// Add listitem token for matched string
					if (allowedLen > 0) {
						tokens.push({ token: 'listitem', n: Math.min(mlen, allowedLen) });
					}
					// Add error token for string exceeding allowed length
					if (allowedLen < mlen) {
						tokens.push({ token: 'error', n: mlen - allowedLen });
					}
				}
				// Create value. If we had a previous value, append to that result.
				let value = {
					value: m[0].slice(0, allowedLen),
				};
				return {
					from,
					to,
					partial: false,
					value,
					error: mlen > allowedLen
						? new Err('cmdFieldTypeKeyword.exceedsMaxLength', '{fieldKey} exceeds max length of {maxLength} characters.', { fieldKey, maxLength })
						: null,
				};
			},
		});
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('keyword');
	}
}

export default CmdFieldTypeKeyword;
