import Err from './Err';

/**
 * UnknownStep consumes all that is left of the stream and issues an error if
 * non-whitespace characters are found.
 */
class UnknownStep {
	constructor() {}

	parse(stream, state) {
		if (!stream) return false;

		if (stream.eatSpace()) {
			return null;
		}
		let m = stream.match(/^(.*[^\s])\s*/);
		state.setParam('unknown', m[1]);
		if (state.error) {
			return 'unknown';
		}

		state.setError(new Err('unknownStep.unableToParse', 'I don\'t understand "{match}".', { match: m[1] }));
		return 'error';
	}
}

export default UnknownStep;
