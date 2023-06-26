import errToL10n from './errToL10n';

/**
 * Converts a LocaleString to an error object.
 * @param {LocaleString} str LocaleString object.
 * @returns {object} Error object: { code, message, data }
 */
export default function l10nToErr(str) {
	str = errToL10n(str);
	return { code: str.translationKey(), message: str.defaultStr(), data: str.defaultParams() };
}
