import Err from 'classes/Err';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import l10n from 'modapp-l10n';

const MaxInteger = 999999999999999; // 15 digits. A value less than javascript's Number.MAX_SAFE_INTEGER
const MinInteger = -999999999999999; // 15 digits. A value greater than javascript's Number.MIN_SAFE_INTEGER

const txtFloatHint = {
	gt: l10n.l('cmdFieldTypeNumber.floatHintGt', "Value must be greater than {min}."),
	gtlt: l10n.l('cmdFieldTypeNumber.floatHintGtLt', "Value must be between {min} (exclusive) and {max} (exclusive)."),
	gtlte: l10n.l('cmdFieldTypeNumber.floatHintGtLte', "Value must be between {min} (exclusive) and {max} (inclusive)."),
	gte: l10n.l('cmdFieldTypeNumber.floatHintGte', "Value must be {min} or greater."),
	gtelt: l10n.l('cmdFieldTypeNumber.floatHintGteLt', "Value must be between {min} (inclusive) and {max} (exclusive)."),
	gtelte: l10n.l('cmdFieldTypeNumber.floatHintGteLte', "Value must be between {min} (inclusive) and {max} (inclusive)."),
	lt: l10n.l('cmdFieldTypeNumber.floatHintLt', "Value must be less than {max}."),
	lte: l10n.l('cmdFieldTypeNumber.floatHintLte', "Value must be {max} or less."),
};

const txtIntegerHint = {
	min: l10n.l('cmdFieldTypeNumber.integerHintMin', "Value must be {min} or greater."),
	minmax: l10n.l('cmdFieldTypeNumber.integerHintMinMax', "Value must be between {min} and {max}, inclusive."),
	max: l10n.l('cmdFieldTypeNumber.integerHintGtMax', "Value must be {max} or less."),
};

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
			getDescInfo: (opts) => this._integerRangeText(opts),
		});
		this.module.cmdPattern.addFieldType({
			id: 'float',
			match: this._match.bind(this, true),
			getDescInfo: (opts) => this._floatRangeText(opts),
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
			err = new Err('cmdFieldTypeNumber.notANumber', '{fieldKey} must be a number.', { fieldKey: firstLetterUppercase(fieldKey) });
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
					err = new Err('cmdFieldTypeNumber.noDecimalsAllowed', '{fieldKey} must not contain decimals.', { fieldKey: firstLetterUppercase(fieldKey) });
					numStr = numStr.slice(0, decimalIdx);
				}
			}

			let num = allowDecimals ? parseFloat(numStr) : parseInt(numStr);
			let outOfBounds = true;
			if (allowDecimals) {
				// Verify range limits
				if (opts?.hasOwnProperty('gt') && num <= opts.gt) {
					err = err || new Err('cmdFieldTypeNumber.fieldMustBeGt', '{fieldKey} must be greater than {min}.', { fieldKey: firstLetterUppercase(fieldKey), min: String(opts.gt) });
				} else if (opts?.hasOwnProperty('gte') && num < opts.gte) {
					err = err || new Err('cmdFieldTypeNumber.fieldMustBeGte', '{fieldKey} must be {min} or greater.', { fieldKey: firstLetterUppercase(fieldKey), min: String(opts.gte) });
				} else if (opts?.hasOwnProperty('lt') && num >= opts.lt) {
					err = err || new Err('cmdFieldTypeNumber.fieldMustBeLt', '{fieldKey} must be less than {max}.', { fieldKey: firstLetterUppercase(fieldKey), max: String(opts.lt) });
				} else if (opts?.hasOwnProperty('lte') && num > opts.lte) {
					err = err || new Err('cmdFieldTypeNumber.fieldMustBeLte', '{fieldKey} must be {max} or less.', { fieldKey: firstLetterUppercase(fieldKey), max: String(opts.lte) });
				} else {
					outOfBounds = false;
				}
			} else {
				// Verify range limis
				let min = opts?.hasOwnProperty('min') ? opts.min : MinInteger;
				let max = opts?.hasOwnProperty('max') ? opts.max : MaxInteger;
				if (num < min) {
					err = err || (num < MinInteger
						? new Err('cmdFieldTypeNumber.fieldTooSmall', '{fieldKey} is too small.', { fieldKey: firstLetterUppercase(fieldKey) })
						: new Err('cmdFieldTypeNumber.fieldMustBeGreater', '{fieldKey} must be {min} or greater.', { fieldKey: firstLetterUppercase(fieldKey), min: String(min) })
					);
				} else if (num > max) {
					err = err || (num > MaxInteger
						? new Err('cmdFieldTypeNumber.fieldTooGreat', '{fieldKey} is too great.', { fieldKey: firstLetterUppercase(fieldKey) })
						: new Err('cmdFieldTypeNumber.fieldMustBeLess', '{fieldKey} must be {max} or less.', { fieldKey: firstLetterUppercase(fieldKey), max: String(max) })
					);
				} else {
					outOfBounds = false;
				}
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

	_integerRangeText(opts) {
		return opts.hasOwnProperty('min')
			? opts.hasOwnProperty('max')
				? l10n.t(txtIntegerHint.maxmin, { min: opts.min, max: opts.max })
				: l10n.t(txtIntegerHint.min, { min: opts.min })
			: opts.hasOwnProperty('max')
				? l10n.t(txtIntegerHint.max, { max: opts.max })
				: null;
	}

	_floatRangeText(opts) {
		return opts.hasOwnProperty('gt')
			? opts.hasOwnProperty('lt')
				? l10n.t(txtFloatHint.gtlt, { min: opts.gt, max: opts.lt })
				: opts.hasOwnProperty('lte')
					? l10n.t(txtFloatHint.gtlte, { min: opts.gt, max: opts.lte })
					: l10n.t(txtFloatHint.gt, { min: opts.gt })
			: opts.hasOwnProperty('gte')
				? opts.hasOwnProperty('lt')
					? l10n.t(txtFloatHint.gtelt, { min: opts.gte, max: opts.lt })
					: opts.hasOwnProperty('lte')
						? l10n.t(txtFloatHint.gtelte, { min: opts.gte, max: opts.lte })
						: l10n.t(txtFloatHint.gte, { min: opts.gte })
				: opts.hasOwnProperty('lt')
					? l10n.t(txtFloatHint.lt, { max: opts.lt })
					: opts.hasOwnProperty('lte')
						? l10n.t(txtFloatHint.lte, { max: opts.lte })
						: null;
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('integer');
		this.module.cmdPattern.removeFieldType('float');
	}
}

export default CmdFieldTypeNumber;
