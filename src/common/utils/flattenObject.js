function flatten(o, obj, path) {
	if (typeof obj == 'object' && obj !== null) {
		path = path ? path + '.' : path;
		for (let k in obj) {
			flatten(o, obj[k], path + k);
		}
	} else {
		o[path] = obj;
	}
}

/**
 * Flattens a nested object. It turns:
 * {"foo":{"baz":42},"bar":true} --> {"foo.baz":42,"bar":true}
 * If the object contains property keys with dots
 * in them, the behavior is unspecified.
 * @param {object} obj Object to flatten.
 * @returns {object} Flattened object
 */
export default function flattenObject(obj) {
	let o = {};
	flatten(o, obj, "");
	return o;
}
