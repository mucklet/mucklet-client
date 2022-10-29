/**
 * Creates a new object with a single property from an object based on a list of
 * possible properties.
 * @param {object} o Object to search for et default values for.
 * @param {Array.<string>} props Properties to search for in order.
 * @returns {object} Returns a new object with a single property, or empty.
 */
export default function getObjectProperty(o, props) {
	props = Array.isArray(props) ? props : Array.prototype.slice.call(arguments, 1);
	if (props) {
		for (let p of props) {
			if (o.hasOwnProperty(p)) {
				return { [p]: o[p] };
			}
		}
	}
	return {};
}
