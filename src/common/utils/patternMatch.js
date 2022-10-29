/**
 * Checks if a needle string matches a haystack by testing if each
 * case-insensitive letter in the needle is found in the haystack in the same
 * order. Spaces in the needle string means that the two adjacent letters should
 * not be directly next to each other in the haystack.
 * @param {string} h Haystack string
 * @param {string} n Needle string
 * @returns {boolean}
 */
export default function(h, n) {
	n = n.trim();
	let l = n.length;
	if (!l) return true;
	h = h.toLowerCase();
	n = n.toLowerCase();
	let i = 0;
	let p = 0;
	while (i < l) {
		let c = n.charAt(i++);
		if (c === ' ') {
			p++;
			while (n.charAt(i) === ' ') {
				i++;
			}
			continue;
		}
		p = h.indexOf(c, p) + 1;
		if (!p) return false;
	}
	return true;
}

/**
 * Appends some em and span nodes to a el div.
 * @param {HTMLElement} el Div element to append to.
 * @param {string} label String to get the text from
 * @param {number} p0 Index where the em tag starts.
 * @param {number} p1 Index where the em tag ends and the span tag starts.
 * @param {number} p2 Index where the span tag ends.
 */
function append(el, label, p0, p1, p2) {
	if (p1 > p0) {
		let em = document.createElement('em');
		em.textContent = label.slice(p0, p1);
		el.appendChild(em);
	}

	if (p2 > p1) {
		let span = document.createElement('span');
		span.textContent = label.slice(p1, p2);
		el.appendChild(span);
	}
};


export function patternMatchRender(item, value) {
	let el = document.createElement("div");
	let label = item.label;
	let n = value.trim().toLowerCase();
	let l = n.length;
	let h = label.toLowerCase();
	let i = 0;
	let p0 = 0;
	let p1 = 0;
	while (i < l) {
		let c = n.charAt(i++);
		if (c === ' ') {
			append(el, label, p0, p1, p1 + 1);
			p1++;
			p0 = p1;
			while (n.charAt(i) === ' ') {
				i++;
			}
			continue;
		}
		let p2 = h.indexOf(c, p1);
		if (p2 === -1) break;
		if (p2 === p1) {
			p1++;
			continue;
		}

		append(el, label, p0, p1, p2);
		p0 = p2;
		p1 = p2 + 1;
	}

	append(el, label, p0, p1, label.length);
	return el;
}
