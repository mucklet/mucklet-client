import Err from 'classes/Err';
import firstLetterUppercase from 'utils/firstLetterUppercase';

/**
 * CmdFieldTypeNumber registers the "integer" and "float" field type for custom
 * commands.
 */
class CmdFieldTypeNumber {
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
			id: 'integer',
			match: this._match.bind(this, false),
		});
		this.module.cmdPattern.addFieldType({
			id: 'float',
			match: this._match.bind(this, true),
		});
	}

	_match(allowDecimals, fieldKey, str, opts, delims, tags, prevValue) {
		let len = str.length;
		str = str.trimStart();
		let from = len - str.length;
		// Match any number or letter character even if it is not 0-9. This is
		// to allow us to give an error but yet continue parsing any remaining
		// input.
		let m = str.match(/^[-.\p{L}\p{N}]+/u);

		// No match at all
		if (!m) {
			return null;
		}

		let err = null;
		let value = null;

		let nm = m[0].match(/^-?\d+\.?\d*/);
		// Match doesn't seem to be a valid number
		if (!nm || nm[0].length != m[0].length) {
			err = new Err('cmdFieldTypeInteger.notANumber', '{fieldKey} must be a number.', { fieldKey: firstLetterUppercase(fieldKey) });
			if (tags) {
				// Did we consume space. Add a null tag.
				if (from > 0) {
					tags.push({ tag: null, n: from });
				}
				// The rest is an error
				tags.push({ tag: 'error', n: m[0].length });
			}
		} else {
			let mlen = m[0].length;
			let numStr = m[0];
			if (!allowDecimals) {
				let decimalIdx = m[0].indexOf('.');
				if (decimalIdx >= 0) {
					err = new Err('cmdFieldTypeInteger.noDecimalsAllowed', '{fieldKey} must not contain decimals.', { fieldKey: firstLetterUppercase(fieldKey) });
					numStr = numStr.slice(0, decimalIdx);
				}
			}

			let num = allowDecimals ? parseFloat(numStr) : parseInt(numStr);
			let outOfBounds = false;
			if (opts?.hasOwnProperty('min') && num < opts.min) {
				err = err || new Err('cmdFieldTypeInteger.lowerThanMin', '{fieldKey} must be {min} or greater.', { fieldKey: firstLetterUppercase(fieldKey), min: String(opts.min) });
				outOfBounds = true;
			} else if (opts?.hasOwnProperty('max') && num > opts.max) {
				err = err || new Err('cmdFieldTypeInteger.greaterThanMax', '{fieldKey} must not be greater than {max}.', { fieldKey: firstLetterUppercase(fieldKey), max: String(opts.max) });
				outOfBounds = true;
			}

			// Add tags
			if (tags) {
				// Did we consume space. Add a null tag.
				if (from > 0) {
					tags.push({ tag: null, n: from });
				}
				// Error or number tag based on if we are within bounds.
				tags.push({ tag: outOfBounds ? 'error' : 'number', n: numStr.length });
				if (mlen > numStr.length) {
					// Add error tag for decimals
					tags.push({ tag: 'error', n: mlen - numStr.length });
				}
			}

			value = {
				value: num,
			};
		}

		return {
			from,
			to: from + m[0].length,
			partial: false,
			value,
			error: err,
		};
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('integer');
	}
}

export default CmdFieldTypeNumber;
