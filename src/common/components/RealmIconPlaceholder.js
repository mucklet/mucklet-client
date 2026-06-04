/**
 * RealmIconPlaceholder renders the realm icon placeholder SVG inline.
 */
class RealmIconPlaceholder {
	/**
	 * Creates an instance of RealmIconPlaceholder.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Additional class names.
	 */
	constructor(opt) {
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svg.setAttribute('viewBox', '0 0 840 840');
		this.svg.setAttribute('fill', 'currentColor');
		this.svg.setAttribute('class', 'realmiconplaceholder' + (opt?.className ? ' ' + opt.className : ''));

		this.svg.innerHTML = `<path
		d="m 756,221.2 v 22.4 a 11.2,11.2 0 0 1 -11.2,11.2 h -33.6 v 16.8 c 0,9.2778 -7.5222,16.8 -16.8,16.8 H 145.6 c -9.2778,0 -16.8,-7.5222 -16.8,-16.8 V 254.8 H 95.2 A 11.2,11.2 0 0 1 84,243.6 v -22.4 a 11.2,11.2 0 0 1 6.917397,-10.3488 L 415.7174,87.651202 a 11.1944,11.1944 0 0 1 8.5652,0 l 324.8,123.199998 A 11.2,11.2 0 0 1 756,221.2 Z M 722.4,646.8 H 117.6 C 99.042997,646.8 84,661.843 84,680.4 v 22.4 A 11.2,11.2 0 0 0 95.2,714 H 744.8 A 11.2,11.2 0 0 0 756,702.8 v -22.4 c 0,-18.557 -15.043,-33.6 -33.6,-33.6 z M 196,310.8 v 268.8 h -50.4 c -9.2778,0 -16.8,7.5222 -16.8,16.8 v 28 h 582.4 v -28 c 0,-9.2778 -7.5222,-16.8 -16.8,-16.8 H 644 V 310.8 H 554.4 V 579.6 H 464.8 V 310.8 H 375.2 V 579.6 H 285.6 V 310.8 Z" />`;
	}

	render(el) {
		el.appendChild(this.svg);
		return this.svg;
	}

	unrender() {
		this.svg.parentNode?.removeChild(this.svg);
	}

	getElement() {
		return this.svg;
	}
}

export default RealmIconPlaceholder;
