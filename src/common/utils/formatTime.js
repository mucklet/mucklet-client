/**
 * Formats the time of Date object to a string in human readable format.
 * @param {Date} date Date object.
 * @param {object} [opt] Optional params.
 * @param {boolean} [opt.showSeconds] Flag to show seconds.
 * @param {boolean} [opt.showMilliseconds] Flag to show seconds and milliseconds. If true, showSeconds is ignored.
 * @returns {string} Formatted string.
 */
export default function formatTime(date, opt) {
	let s = date.getHours() + ":" + ("0" + date.getMinutes()).slice(-2);
	if (opt) {
		if (opt.showMilliseconds) {
			s += ":" + ("0" + date.getSeconds()).slice(-2) + '.' + ("000" + date.getMilliseconds()).slice(-4);
		} else if (opt.showSeconds) {
			s += ":" + ("0" + date.getSeconds()).slice(-2);
		}
	}
	return s;
}
