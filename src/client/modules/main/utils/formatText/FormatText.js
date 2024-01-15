import FormatTxt from 'components/FormatTxt';
import formatText, { firstTriggerWord, filterTriggers, formatTextTokens } from 'utils/formatText';

/**
 * FormatText exposes the formatText utils functions.
 */
class FormatText {
	constructor(app, params) {
		this.app = app;

		this.app.require([], this._init.bind(this));
	}

	_init(module) {}

	/**
	 * Formats a string, escapes it and formats it so that _this_ becomes italic and
	 * **that** becomes bold.
	 * @param {string} str Text to format.
	 * @param {object} [opt] Optional parameters
	 * @param {Array.<object>} [opt.triggers] Array of trigger objects
	 * @param {object} [opt.em] Token object for em.
	 * @param {object} [opt.strong] Token object for strong.
	 * @param {object} [opt.ooc] Token object for ooc
	 * @param {object} [opt.cmd] Token object for cmd
	 * @param {object} [opt.sup] Token object for sup
	 * @param {object} [opt.sub] Token object for sub
	 * @param {object} [opt.strikethrough] Token object for strikethrough
	 * @returns {string} HTML formatted string.
	 */
	formatText(str, opt) {
		return formatText(str, opt);
	}

	/**
	 * Get the first trigger word.
	 * @param {string} str Text to scan for triggers.
	 * @param {Array.<object>} triggers Array of trigger objects
	 * @returns {string} First text matching a trigger.
	 */
	firstTriggerWord(str, triggers) {
		return firstTriggerWord(str, triggers);
	}

	/**
	 * Filter trigger arrays to only contain triggers existing in the text.
	 * @param {string} str Text to scan for triggers.
	 * @param {Array.<object>} triggers Array of trigger objects
	 * @returns {?Array.<object>} Array of triggers existing in the text. Or null if no triggers matches.
	 */
	filterTriggers(str, triggers) {
		return filterTriggers(str, triggers);
	}

	/**
	 * Formats a string, escapes it and formats it so that _this_ becomes italic and
	 * **that** becomes bold.
	 * @param {string} str Text to format.
	 * @param {object} [opt] Optional parameters
	 * @returns {Array.<Token>} Array of Tokens.
	 */
	formatTextTokens(str, opt) {
		return formatTextTokens(str, opt);
	}

	/**
	 * Creates an instance of FormatTxt which is a component for formatted text
	 * with support for interactive elements such as sections.
	 * @param {string} str Text to format
	 * @param {object} [opt] Optional parameters as defined by RootElem.
	 * @param {boolean} [opt.noInteraction] Flag to disable clickable interactions like toggling sections.
	 * @returns {FormatTxt} FormatTxt component.
	 */
	newFormatTxt(str, opt) {
		return new FormatTxt(str, opt);
	}
}

export default FormatText;
