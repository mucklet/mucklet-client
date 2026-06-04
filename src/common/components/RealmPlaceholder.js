/**
 * RealmPlaceholder renders the realm placeholder SVG inline.
 */
class RealmPlaceholder {
	/**
	 * Creates an instance of RealmPlaceholder.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Additional class names.
	 */
	constructor(opt) {
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svg.setAttribute('viewBox', '0 0 960 540');
		this.svg.setAttribute('fill', 'currentColor');
		this.svg.setAttribute('class', 'realmplaceholder' + (opt?.className ? ' ' + opt.className : ''));

		this.svg.innerHTML = `<path
		d="M 960,300 810,150 630,330 540,240 330,450 210,330 150,390 0,240 V 540 h 960 z" />
	<circle
		cx="210"
		cy="150"
		r="90" />`;
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

export default RealmPlaceholder;
