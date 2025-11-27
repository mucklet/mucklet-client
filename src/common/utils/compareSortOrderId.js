/**
 * Compare function for objects with an id property and optional sortOrder
 * property that will be used for sorting in ascending order.
 *
 * Objects with a sortOrder property will be come before objects without
 * sortOrder. If the sortOrder property is equal, sorting will fall back to sort
 * by the id property.
 * @param {{ id:string, sortOrder?:number }} a Object to sort.
 * @param {{ id:string, sortOrder?:number }} b Object to sort.
 * @returns {number} A compare number. See the Array.sort method for more info.
 */
export default function compareSortOrderId(a, b) {
	// Validate we have actual objects.
	let an = Number(a.sortOrder);
	let bn = Number(b.sortOrder);
	let d = (isNaN(an) || isNaN(bn))
		? !isNaN(an) ? -1 : !isNaN(bn) ? 1 : 0
		: a.sortOrder - b.sortOrder;
	return d || a.id.localeCompare(b.id);
};
