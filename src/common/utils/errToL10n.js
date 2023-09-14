import l10n from 'modapp-l10n';

/**
 * Turns an error object into a LocaleString.
 * @param {object} err Error object such as an ResError.
 * @returns {LocaleString} Locale string.
 */
export default function errToL10n(err) {
	if (typeof err != 'object' || err === null || !(err.code && err.message)) {
		return l10n.isLocaleString(err)
			? err
			: l10n.l('system.unknownError', "Unknown error: {json}", { json: JSON.stringify(err) });
	}
	return l10n.l(err.code, err.message, err.data);
}
