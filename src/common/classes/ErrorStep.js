import Err from './Err';

/**
 * ErrorStep tests of the stream matches the regex, and if so sets the error.
 * If errNoMatch is not null, that error is set on no match.
 */
class ErrorStep {
	constructor(regex, err, errNoMatch = null) {
		this.regex = regex;
		this.err = err || (match => new Err('errorStep.errorCommand', 'Erronous command "{match}".', { match }));
		this.errNoMatch = errNoMatch;
	}

	parse(stream, state) {
		let m = stream?.match(this.regex);
		if (!m) {
			if (this.errNoMatch) {
				state.setError(this.errNoMatch);
			}
			return false;
		}

		state.setError(typeof this.err == 'function' ? this.err(m[1]) : this.err);
		return 'error';
	}
}

export default ErrorStep;
