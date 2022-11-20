/**
 * Compares two objects and returns an object with properties to set to get before object to have the same keys as the after object.
 * If a property value is undefined, that key is missing in the after object.
 * @param {object} before Object before.
 * @param {object} after Object after.
 * @returns {object} Returns the object diff.
 */
export default function objectDiff(before, after) {
	let diff = {};
	before = before || {};
	after = after || {};
	for (let key in after) {
		if (!before[key]) {
			diff[key] = after[key];
		}
	}
	for (let key in before) {
		if (!after[key]) {
			diff[key] = undefined;
		}
	}

	return diff;
}
