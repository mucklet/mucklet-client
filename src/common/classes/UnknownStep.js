/**
 * UnknownStep consumes all that is left of the stream and issues an error if
 * non-whitespace characters are found.
 */
class UnknownStep {
	constructor() {}

	parse(stream, s) {
		if (!stream) return false;

		if (stream.eatSpace()) {
			return null;
		}
		let m = stream.match(/^(.*[^\s])\s*/);
		s.setParam('unknown', m[1]);
		if (s.error) {
			return 'unknown';
		}

		s.setError({ code: 'unknownStep.unableToParse', message: 'I don\'t understand "{match}".', data: { match: m[1] }});
		return 'error';
	}
}

export default UnknownStep;
