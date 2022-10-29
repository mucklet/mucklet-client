/**
 * Adds the render and unrender methods to an element, to make it implement the
 * Component interface.Formats a duration in milliseconds to the format 1d 2h 3m
 * 4s 5ms.
 * @param {Elem} el HTML element
 * @returns {Elem} The same element.
 */
export default function toComponent(el) {
	el.render = e => {
		e.appendChild(el);
		return el;
	};
	el.unrender = () => el.parentElement.removeChild(el);
	return el;
}
