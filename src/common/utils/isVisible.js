/**
 * Tests if the app is visible by checking document.visibilityState.
 * @returns {boolean}
 */
export default function isVisible() {
	return document.visibilityState == 'visible';
}
