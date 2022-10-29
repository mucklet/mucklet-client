/**
 * Get the fullscreen element.
 * @returns {?Element} Fullscreen element if fullscreen is active, otherwise null.
 */
export function fullscreenElement() {
	return document.fullscreenElement || null;
}

/**
 * Requests fullscreen
 * @param {Element} element DOM element.
 * @param {object} opt Optional params for requestFullscreen.
 * @returns {Promise} Promise to the full screen
 */
export function requestFullscreen(element, opt) {
	return Promise.resolve(element.requestFullscreen
		? element.requestFullscreen(opt)
		: element.mozRequestFullScreen
			? element.mozRequestFullScreen(opt)
			: element.webkitRequestFullScreen
				? element.webkitRequestFullScreen(opt)
				: Promise.reject(new Error("requestFullscreen not supported"))
	);
}

/**
 * Exits fullscreen
 * @returns {Promise} Promise to exiting full screen
 */
export function exitFullscreen() {
	return Promise.resolve(fullscreenElement()
		? document.exitFullscreen
			? document.exitFullscreen()
			: document.mozCancelFullScreen
				? document.mozCancelFullScreen()
				: document.webkitExitFullscreen
					? document.webkitExitFullscreen()
					: Promise.reject(new Error("exitFullscreen not supported"))
		: null
	);
}

/**
 * Check if fullscreen is enabled in the browser.
 * @returns {boolean} True if fullscreen can be activated calling requestFullscreen, otherwise false.
 */
export function fullscreenEnabled() {
	return document.fullscreenEnabled ||
		document.mozFullScreenEnabled ||
		document.documentElement.webkitRequestFullScreen;
}
