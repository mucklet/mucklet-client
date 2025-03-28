import { keyRegex } from 'utils/regex';
import Err from 'classes/Err';
import indexOfChars from 'utils/indexOfChars';
import firstLetterUppercase from 'utils/firstLetterUppercase';

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
			match: (charId, fieldKey, str, opts, delims, tags, prevValue) => {
				let len = str.length;
				str = str.trimStart();
				let from = len - str.length;
				let m = str.match(keyRegex);
				let mlen = m ? m[0].length : 0;

				// Check if we find one of the delimiters within the match
				if (delims && mlen) {
					// Try to find a delimiter
					let idx = indexOfChars(str.slice(0, mlen), delims);
					// If found we set the new match length
					if (idx >= 0) {
						mlen = idx;
					}
				}

				let maxLength = opts.maxLength || this.module.info.getCore().keyMaxLength;
				let minLength = opts.minLength || 0;
				let to = from + mlen;

				// If we require some text, but have nothing, it is not a match.
				if (!mlen && minLength > 0) {
					return null;
				}

				// Add tags
				if (tags) {
					// Did we consume space. Add a null tag.
					if (from > 0) {
						tags.push({ tag: null, n: from });
					}
					// Did we not meet the minimum length
					if (mlen < minLength) {
						tags.push({ tag: 'error', n: mlen });
					} else {
						// Add listitem tag for matched string
						tags.push({ tag: 'listitem', n: Math.min(mlen, maxLength) });

						// Add error tag for string exceeding max length
						if (maxLength < mlen) {
							tags.push({ tag: 'error', n: mlen - maxLength });
						}
					}
				}
				// Create value. If we had a previous value, append to that result.
				let value = {
					value: m?.[0].slice(0, maxLength) || '',
				};
				return {
					from,
					to,
					partial: false,
					value,
					error: mlen > maxLength
						? new Err('cmdFieldTypeKeyword.exceedsMaxLength', '{fieldKey} exceeds max length of {maxLength} characters.', { fieldKey: firstLetterUppercase(fieldKey), maxLength })
						: mlen < minLength
							? new Err('cmdFieldTypeText.exceedsMaxLength', '{fieldKey} is less than {minLength} characters.', { fieldKey: firstLetterUppercase(fieldKey), minLength })
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
