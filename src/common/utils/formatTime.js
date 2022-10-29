/**
 * Formats the time of Date object to a string in human readable format.
 * @param {Date} date Date object.
 * @returns {string} Formatted string.
 */
export default function formatTime(date) {
	return date.getHours() + ":" + ("0" + date.getMinutes()).slice(-2);
}
