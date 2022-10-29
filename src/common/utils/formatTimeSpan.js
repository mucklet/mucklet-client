import formatDateTime from './formatDateTime';
import formatTime from './formatTime';

/**
 * Formats two Date objects into a string in human readable time span format,
 * including dates if needed.
 * @param {Date} startTime Date object.
 * @param {Date} endTime Date object.
 * @returns {string} Formatted string.
 */
export default function formatTimeSpan(startTime, endTime) {
	let sdate = startTime && startTime.toDateString();
	let edate = endTime && endTime.toDateString();
	let ndate = new Date().toDateString();

	return (startTime
		? sdate == edate && sdate == ndate
			? formatTime(startTime)
			: formatDateTime(startTime)
		: ''
	) + " – " + (endTime
		? edate == sdate
			? formatTime(endTime)
			: formatDateTime(endTime)
		: ''
	).trim();
}
