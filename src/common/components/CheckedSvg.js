/**
 * CheckedSvg renders a checked SVG inline.
 */
class CheckedSvg {
	/**
	 * Creates an instance of CheckedSvg.
	 * @param {number} width Width in squares.
	 * @param {number} height height in squares.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Additional class names.
	 */
	constructor(width, height, opt) {
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
		this.svg.setAttribute('fill', 'currentColor');
		this.svg.setAttribute('class', 'checkedsvg' + (opt?.className ? ' ' + opt.className : ''));

		let d = ``;
		for (let y = 0; y < height; y++) {
			for (let x = y % 2; x < width; x += 2) {
				d += `M${x} ${y}h1v1H${x}z`;
			}
		}
		this.svg.innerHTML = `<path d="${d}">`;

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

export default CheckedSvg;
