const regex = /^ *(([0-9]+) *d)? *(([0-9]+) *h)? *(([0-9]+) *m)? *(([0-9]+) *s)? *(([0-9]+) *ms)? *$/;

/**
 * Parses a duration string and returns the value in milliseconds, or null if the string couldn't be parsed.
 * @param {string} s Duration string in the format "1d 2h 3m 4s 5ms"
 * @returns {number} Duration in milliseconds or null
 */
export default function parseDuration(s) {
	s = (s || "").trim();
	if (!s) return null;

	let m = s.match(regex);
	if (!m) return null;

	return (Number(m[2]) || 0) * 1000 * 60 * 60 * 24 +
		(Number(m[4]) || 0) * 1000 * 60 * 60 +
		(Number(m[6]) || 0) * 1000 * 60 +
		(Number(m[8]) || 0) * 1000 +
		(Number(m[10]) || 0);
}

export { regex as durationRegex };
