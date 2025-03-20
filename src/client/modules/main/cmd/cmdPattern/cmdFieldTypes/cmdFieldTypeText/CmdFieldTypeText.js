import Err from 'classes/Err';
import indexOfChars from 'utils/indexOfChars';
import l10n from 'modapp-l10n';

const txtSpanLinesHint = l10n.l('cmdFieldTypeText.spanLinesHint', "May span multiple paragraphs.");
const txtFormatTextHint = l10n.l('cmdFieldTypeText.FormatTextHint', "May be formatted.");
const txtSpanLinesAndFormatTextHint = l10n.l('cmdFieldTypeText.spanLinesAndFormatTextHint', "May be formatted and span multiple paragraphs.");

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
			match: (fieldKey, str, opts, delims, tags, prevValue) => {
				let len = str.length;
				let to = len;
				// Remove leading spacing for first line
				if (!prevValue) {
					str = str.trimStart();
				}
				let from = len - str.length;
				// Remove trailing space
				str = str.trimEnd();
				let mlen = str.length;
				let trimmed = len - from - mlen;

				// Check if we find one of the delimiters
				if (delims) {
					// Special case where a space delimiter and an empty match
					// means this Text field doesn't match.
					if (!mlen && delims.includes(' ')) {
						return null;
					}
					// Try to find a delimiter
					let idx = indexOfChars(str, delims);
					if (idx >= 0) {
						str = str.slice(0, idx).trimEnd();
						mlen = str.length;
						trimmed = 0;
						to = from + mlen;
					}
				}

				let maxLength = opts.maxLength || this.module.info.getCore().descriptionMaxLength;
				let allowedLen = Math.max(0, maxLength - (prevValue ? prevValue.value.length + 1 /** new line */ : 0));
				// Add tags
				if (tags) {
					// Did we consume space. Add a null tag.
					if (from > 0) {
						tags.push({ tag: null, n: from });
					}
					// Did we match any other tag
					if (mlen) {
						// Add text tag for matched string
						if (allowedLen > 0) {
							tags.push({ tag: 'text', n: Math.min(mlen, allowedLen) });
						}
						// Add error tag for string exceeding allowed length
						if (allowedLen < mlen) {
							tags.push({ tag: 'error', n: mlen - allowedLen });
						}
					}
					// Add tag for trimmed trailing space
					if (trimmed > 0) {
						tags.push({ tag: null, n: trimmed });
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
					to,
					partial: false,
					more: opts.spanLines,
					value,
					error: mlen > allowedLen
						? new Err('cmdFieldTypeText.exceedsMaxLength', '{fieldKey} exceeds max length of {maxLength} characters.', { fieldKey, maxLength })
						: null,
				};
			},
			formatText: (opts) => {
				return opts.formatText
					? {}
					: null;
			},
			getDescInfo: (opts) => {
				return opts.spanLines
					? opts.formatText
						? l10n.t(txtSpanLinesAndFormatTextHint)
						: l10n.t(txtSpanLinesHint)
					: opts.formatText
						? l10n.t(txtFormatTextHint)
						: null;
			},
		});
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('text');
	}
}

export default CmdFieldTypeText;
