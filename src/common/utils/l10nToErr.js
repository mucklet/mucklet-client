import Err from 'classes/Err';
import errToL10n from './errToL10n';

/**
 * Converts a LocaleString to an error object.
 * @param {LocaleString} str LocaleString object.
 * @returns {Err} Error object.
 */
export default function l10nToErr(str) {
	str = errToL10n(str);
	return new Err(str.translationKey(), str.defaultStr(), str.defaultParams());
}
