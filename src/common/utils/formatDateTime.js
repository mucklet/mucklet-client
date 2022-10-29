import formatDate from './formatDate';
import formatTime from './formatTime';

/**
 * Formats a Date object to a string in human readable format with date and
 * time.
 * @param {Date} date Date object.
 * @param {object} [opt] Optional params. See formatDate.
 * @returns {string} Formatted string.
 */
export default function formatDateTime(date, opt) {
	return date ? formatDate(date, opt) + ", " + formatTime(date, opt) : "-";
}
