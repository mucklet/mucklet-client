/**
 * Calls the callback on next animation frame.
 * @param {function} cb Callback function.
 */
export default function nextFrame(cb) {
	requestAnimationFrame(() => requestAnimationFrame(cb));
}
