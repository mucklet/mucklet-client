import { Elem, Txt, Html } from 'modapp-base-component';

class RollEventComponent extends Elem {
	constructor(charId, ev, opt) {
		opt = opt || {};
		let c = ev.char;

		let s = "";
		let showDetails = ev.result.length > 1;
		for (let p of ev.result) {
			if (s) {
				s += '<span> ' + (p.op || "+") + ' </span>';
			} else if (p.op == "-") {
				s += '<span>-</span>';
			}
			switch (p.type) {
				case "mod":
					s += '<span>' + Number(p.value) + '</span>';
					break;
				case "std":
					s += '<span>' + Number(p.count) + '</span>'
						+ '<span class="charlog--cmd">d</span>'
						+ '<span>' + Number(p.sides) + '</span>';
					showDetails |= p.count > 1;
					break;
				default:
					s += escapeHtml(p.type);
			}
		}

		let d = "";
		if (c && c.id === charId && showDetails) {
			for (let p of ev.result) {
				if (d) {
					d += '<span> ' + (p.op || "+") + ' </span>';
				} else if (p.op == "-") {
					d += '<span>-</span>';
				}
				switch (p.type) {
					case "mod":
						d += '<span>' + Number(p.value) + '</span>';
						break;
					case "std":
						let multi = p.dice.length > 1;
						d += (multi ? '<span>(</span>' : '')
							+ '<span>' + p.dice.join(', ') + '</span>'
							+ (multi ? '<span>)</span>' : '')
							+ '<sub>' + p.sides + '</sub>';
						break;
					default:
						d += escapeHtml(p.type);
				}
			}
		}

		super(n => n.elem('div', { className: 'charlog--highlight' }, [
			n.component(new Txt(c && c.name, { className: 'charlog--char' })),
			n.elem('span', { className: 'charlog--tag' }, [ n.text(" roll") ]),
			n.elem('span', { className: 'charlog--oocs' }, [
				n.text(' rolls '),
				n.component(new Html(s, { tagName: 'span' })),
				n.text('. Result: '),
				n.elem('span', { className: 'charlog--comm' }, [ n.text(ev.total) ]),
				n.text('.'),
				n.component(d ? new Html(" " + d, { tagName: 'span', className: 'charlog--ooc' }) : null),
			]),
		]));
	}

	get isCommunication() {
		return true;
	}
}

export default RollEventComponent;
