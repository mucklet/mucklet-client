/**
 * Formats a Date object to an iso (1977-08-13) format.
 * @param {Date} date Date object.
 * @returns {string} Formatted string.
 */
export default function(date) {
	return [
		date.getFullYear(),
		('0' + (date.getMonth() + 1)).slice(-2),
		('0' + date.getDate()).slice(-2),
	].join('-');
}
