import Err from 'classes/Err';
import indexOfChars from 'utils/indexOfChars';
import l10n from 'modapp-l10n';
import firstLetterUppercase from 'utils/firstLetterUppercase';

const txtSpanLinesHint = l10n.l('cmdFieldTypeText.spanLinesHint', "May span multiple paragraphs.");
const txtFormatTextHint = l10n.l('cmdFieldTypeText.formatTextHint', "May be formatted.");
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
			'cmdLists',
		], this._init.bind(this));
	}

	_init(module) {
		/**
		 * @type {{
		 * 	cmdPattern: import('modules/main/cmd/cmdPattern/CmdPattern').default,
		 * 	info: import('modules/main/addons/info/Info').default,
		* 	cmdLists: import('modules/main/cmd/cmdLists/CmdLists').default,
		 * }}
		 */
		this.module = module;
		this.module.cmdPattern.addFieldType({
			id: 'text',
			match: (charId, fieldKey, str, opts, delims, tags, prevValue) => {
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
				let minLength = opts.minLength || 0;
				let prevLen = (prevValue ? prevValue.value.length + 1 /** new line */ : 0);
				let allowedLen = Math.max(0, maxLength - prevLen);
				let requiredLen = Math.max(0, minLength - prevLen);

				// If we require some text, but have nothing, it is not a match.
				if (prevLen + mlen == 0 && requiredLen > 0) {
					return null;
				}

				// Add tags
				if (tags) {
					// Did we consume space. Add a null tag.
					if (from > 0) {
						tags.push({ tag: null, n: from });
					}
					// Did we not meet the required length
					if (mlen < requiredLen) {
						tags.push({ tag: 'error', n: mlen });
					// Did we match some text
					} else if (mlen) {
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
						? new Err('cmdFieldTypeText.exceedsMaxLength', '{fieldKey} exceeds max length of {maxLength} characters.', { fieldKey: firstLetterUppercase(fieldKey), maxLength })
						: mlen < requiredLen
							? new Err('cmdFieldTypeText.exceedsMaxLength', '{fieldKey} is less than {minLength} characters.', { fieldKey: firstLetterUppercase(fieldKey), minLength })
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
			complete: (ctx, str, pos, opts) => {
				let list = this.module.cmdLists.getCharsAwake({
					filterMuted: true,
					sortOrder: [ 'watch', 'room' ],
				});
				return list.complete(str, pos, ctx, true);
			},
		});
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('text');
	}
}

export default CmdFieldTypeText;
