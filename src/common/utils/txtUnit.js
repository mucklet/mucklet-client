import l10n from 'modapp-l10n';


const txtUnits = {
	days: amount => amount == 1
		? l10n.l('txtUnits.day', "1 day")
		: l10n.l('txtUnits.days', "{amount} days", { amount }),
	months: amount => amount == 1
		? l10n.l('txtUnits.month', "1 month")
		: l10n.l('txtUnits.months', "{amount} months", { amount }),
};

const unknownUnit = amount => String(amount);

/**
 * Returns the locale string of a unit and a amount.
 * @param {string} unit Unit.
 * @param {number} amount Amount.
 * @returns {LocaleString} Unit as locale string.
 */
export function toLocaleString(unit, amount) {
	return (txtUnits[unit] || unknownUnit)(amount);
};
