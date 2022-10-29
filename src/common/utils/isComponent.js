/**
 * Tests if an object is has a render and unrender method, making it a component.
 * @param {*} o Object to test.
 * @returns {boolean} True if it is a component, otherwise false.
 */
export default function(o) {
	return typeof o == 'object' && o !== null && typeof o.render == 'function' && typeof o.unrender == 'function';
}
