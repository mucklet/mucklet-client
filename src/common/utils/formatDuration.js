const units = [
	{ unit: 'ms', m: 1000 },
	{ unit: 's', m: 60 },
	{ unit: 'm', m: 60 },
	{ unit: 'h', m: 24 },
	{ unit: 'd', m: 0 },
];

/**
 * Formats a duration in milliseconds to the format 1d 2h 3m 4s 5ms.
 * @param {number} d Duration in milliseconds.
 * @param {string} [zero] The zero string returned if the value is equal or less than 0. Defaults to "0h 0m 0s"
 * @returns {string} Formatted string
 */
export default function formatDuration(d, zero) {
	if (typeof d != 'number') {
		return '';
	}
	if (d <= 0) {
		return zero || '0h 0m 0s';
	}

	d = Math.floor(d);
	let s = "";
	for (let u of units) {
		let m = u.m;
		let p = m ? d % m : d;
		d = Math.floor(d / m);
		if (s || p) {
			s = p.toString() + u.unit + (s ? ' ' + s : '');
		}
		if (!d) {
			break;
		}
	}
	return s;
}
