import DelimStep from 'classes/DelimStep';
import RegexStep from 'classes/RegexStep';
import Err from './Err';

/**
 * GradientStep consumes a hex gradient color Eg. /#000000#c1a657
 */
class GradientStep extends DelimStep {

	/**
	 * Creates an instance of ColorStep.
	 * @param {string} id Id used as key when setting param values.
	 * @param {object} [opt] Optional params.
	 * @param {string} [opt.name] Name used in error outputs. Defaults to the id value.
	 * @param {string} [opt.token] Token name. Defaults to 'entityid'.
	 * @param {string} [opt.delimToken] Delimiter token name. Defaults to 'delim'.
	 * @param {Step} [opt.next] Next step after a matched color code.
	 * @param {Step} [opt.else] Step after if the color code is missing. Will disabled any errRequired set.
	 * @param {?function} [opt.errRequired] Callback function that returns an error when it fails to match. Null means it is not required.: function(this)
	 * @param {function} [opt.errInvalid] Callback function that returns an invalid error if the # is not followed by a valid color code.
	 */
	constructor(id, opt) {
		let errInvalid = opt?.errInvalid || ((self, m) => (
			new Err('idStep.invalid', 'There is no {name}. Expected a /, followed by 2 #-sign colors each 3 or 6 hexadecimal digits.', { name: self.name, value: m })
		));
		let regexStep = new RegexStep(id, /^.+/, {
			name: opt?.name || id,
			token: opt?.token || 'listitem',
			errRequired: self => errInvalid(self, ''),
			validate: (self, value) => !value.match(/^(#(?:[0-9a-fA-F]{3,3}){1,2}){2,2}$/)
				? errInvalid(self, value)
				: null,
			prepareValue: str => '/' + str.toLowerCase(),
			next: opt?.next,
		});
		super('/', {
			token: opt?.delimToken || 'listitem',
			errRequired: opt.hasOwnProperty('errRequired') ? opt.errRequired
				: self => new Err('idStep.required', 'There is no {name}. Expected a /, followed by 2 #-sign colors each 3 or 6 hexadecimal digits.', { name: self.name }),
			next: [
				regexStep,
			],
			else: opt?.else,
		});
	}
}

export default GradientStep;
