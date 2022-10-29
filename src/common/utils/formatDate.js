const months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

/**
 * Formats a Date object to a string in human readable format.
 * @param {Date} date Date object.
 * @param {object} [opt] Optional parameters.
 * @param {boolean} [opt.showYear] Flag to always show year.
 * @returns {string} Formatted string.
 */
export default function(date, opt) {
	opt = opt || {};
	let n = new Date();
	// Add year if older than a year
	return date.getDate() + " " + months[date.getMonth()] + (opt.showYear || date < new Date(n.getFullYear() - 1, n.getMonth(), n.getDate()) ? " " + date.getFullYear() : "");
}
