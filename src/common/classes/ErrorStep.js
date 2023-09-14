import Err from './Err';

/**
 * ErrorStep tests of the stream matches the regex, and if so sets the error.
 */
class ErrorStep {
	constructor(regex, err) {
		this.regex = regex;
		this.err = err || (match => new Err('errorStep.errorCommand', 'Erronous command "{match}".', { match }));
	}

	parse(stream, s) {
		if (!stream) return false;

		let m = stream.match(this.regex);
		if (!m) {
			return false;
		}

		s.setError(typeof this.err == 'function' ? this.err(m[1]) : this.err);
		return 'error';
	}
}

export default ErrorStep;
