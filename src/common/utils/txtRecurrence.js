import l10n from 'modapp-l10n';


const txtRecurrences = {
	once: l10n.l('txtRecurrence.once', "Once"),
	month: l10n.l('txtRecurrence.month', "1 month"),
	quarter: l10n.l('txtRecurrence.quarter', "3 months"),
	halfYear: l10n.l('txtRecurrence.halfYear', "6 months"),
	year: l10n.l('txtRecurrence.year', "12 months"),
};

const txtRecurrenceUnits = {
	once: l10n.l('txtRecurrence.oneTime', "one time"),
	month: l10n.l('txtRecurrence.perMonth', "per month"),
	quarter: l10n.l('txtRecurrence.perMonth', "per 3 months"),
	halfYear: l10n.l('txtRecurrence.perMonth', "per 6 months"),
	year: l10n.l('txtRecurrence.perMonth', "per year"),
};

const txtRecurrenceInfos = {
	once: l10n.l('txtRecurrence.onceInfo', "No recurring payments. Nothing to cancel."),
	month: l10n.l('txtRecurrence.monthInfo', "Recurring every month. Cancel online anytime."),
	quarter: l10n.l('txtRecurrence.quarterDisclaimer', "Recurring every 3 months. Cancel online anytime."),
	halfYear: l10n.l('txtRecurrence.halfYearDisclaimer', "Recurring every 6 months. Cancel online anytime."),
	year: l10n.l('txtRecurrence.yearDisclaimer', "Recurring every 12 months. Cancel online anytime."),
};

/**
 * Returns the locale string of a recurrence.
 * @param {string} recurrence Recurrence.
 * @returns {LocaleString} Recurrence as locale string.
 */
export function toLocaleString(recurrence) {
	return txtRecurrences[recurrence] || "";
};

/**
 * Returns the locale string of a recurrence unit.
 * @param {string} recurrence Recurrence.
 * @returns {LocaleString} Recurrence unit as locale string.
 */
export function unit(recurrence) {
	return txtRecurrenceUnits[recurrence] || "";
};

/**
 * Returns the locale string of a recurrence info.
 * @param {string} recurrence Recurrence.
 * @returns {LocaleString} Recurrence info as locale string.
 */
export function info(recurrence) {
	return txtRecurrenceInfos[recurrence] || "";
};
