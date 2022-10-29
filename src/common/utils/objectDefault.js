/**
 * Sets an objects properties to default values unless they already exist.
 * @param {object} o Object to set default values for.
 * @param {object} def Default values to set.
 * @returns {object} Returns the object o.
 */
export default function objectDefault(o, def) {
	if (def) {
		for (let k in def) {
			if (!o.hasOwnProperty(k)) {
				o[k] = def[k];
			}
		}
	}
	return o;
}
