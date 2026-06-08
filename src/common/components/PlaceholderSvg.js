import './placeholderSvg.scss';

const imgs = {
	room: `<circle cx="220.5" cy="220.5" r="115.5" />` +
		`<path d="M0 840V693l189-189 105 105 315-315 231 231v315z" />`,
	area: `<path d="M285 105q4.6 0 8 3.3 3.2 3.4 3.2 8v517.5q0 7-6 9.8l-168.7 90q-2.4 1.4-5.3 1.4-4.5 0-7.9-3.3-3.3-3.4-3.3-8V206.4q0-7 6-9.9l168.7-90q2.5-1.4 5.3-1.4m438.8 0q4.5 0 7.9 3.3 3.3 3.4 3.3 8v517.5q0 7-6 9.8l-168.7 90q-2.5 1.4-5.3 1.4-4.6 0-8-3.3-3.2-3.4-3.2-8V206.4q0-7 6-9.9l168.7-90q2.4-1.4 5.3-1.4M330 105q2.8 0 5 1l180 90q6.3 3.6 6.3 10.2v517.5q0 4.6-3.4 8-3.3 3.3-7.9 3.3-2.8 0-5-1l-180-90q-6.2-3.6-6.2-10.2V116.1q0-4.5 3.3-7.9 3.3-3.3 7.9-3.3" />`,
	avatar: `<path d="M420 492a204 204 0 1 0 0-408 204 204 0 0 0 0 408m142.8 51h-26.6a278 278 0 0 1-232.4 0h-26.6C158.9 543 63 639 63 757.2V840h714v-82.8C777 638.9 681 543 562.8 543" />`,
};

const errorMark = `<path ` +
	`class="placeholdersvg--mark" ` +
	`d="M420 63C223.36 63 63 223.36 63 420s160.36 357 357 357 357-160.36 357-357S616.64 63 420 63m0 88a268.2 268.2 0 0 1 156.68 50.1L201.1 576.68A268.2 268.2 0 0 1 151 420c0-149.09 119.91-269 269-269m218.9 112.32A268.2 268.2 0 0 1 689 420c0 149.09-119.91 269-269 269a268.2 268.2 0 0 1-156.68-50.1z" />`;

/**
 * PlaceholderSvg renders a placeholder SVG inline.
 */
class PlaceholderSvg {
	/**
	 * Creates an instance of PlaceholderSvg.
	 * @param {"room"|"area"|"avatar"} img Placeholder image.
	 * @param {object} [opt] Optional parameters.
	 * @param {boolean} [opt.withError] Flag to add the error mark.
	 * @param {string} [opt.className] Additional class names.
	 */
	constructor(img, opt) {
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svg.setAttribute('viewBox', '0 0 840 840');
		this.svg.setAttribute('fill', 'currentColor');
		this.svg.setAttribute('class', 'placeholdersvg' + (opt?.className ? ' ' + opt.className : ''));

		this.svg.innerHTML = (imgs[img] || '') + (opt?.withError ? errorMark : '');
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

export default PlaceholderSvg;
