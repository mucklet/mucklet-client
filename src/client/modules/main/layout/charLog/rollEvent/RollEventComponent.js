import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import PopupPill from 'components/PopupPill';

const txtQuietRoll = l10n.l('rollEvent.quiet roll', "Quiet roll");

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
					s += '<span class="charlog--default">' + Number(p.value) + '</span>';
					break;
				case "std":
					s += '<span class="charlog--default">' + Number(p.count) + '</span>'
						+ '<span class="charlog--cmd">d</span>'
						+ '<span class="charlog--default">' + Number(p.sides) + '</span>';
					showDetails |= p.count > 1;
					break;
				default:
					s += escapeHtml(p.type);
			}
		}

		let d = "";
		if (showDetails) {
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

		let inner = n => ([
			n.text(' rolls '),
			n.component(new Html(s, { tagName: 'span' })),
			n.text('. Result: '),
			n.elem('span', { className: 'charlog--comm' }, [ n.text(ev.total) ]),
			n.text('.'),
			n.component(d
				? c.id === charId || ev.mod?.muted
					? new Html(" " + d, { tagName: 'span', className: 'charlog--ooc' })
					: new PopupPill(() => new Html(d, { tagName: 'span', className: 'charlog--ooc' }), {
						type: 'dark',
						className: 'ev-roll--pill',
					})
				: null,
			),
		]);

		super(ev.quiet
			? n => n.elem('div', [
				n.elem('div', { className: 'charlog--fieldset' }, [
					n.elem('div', { className: 'charlog--fieldset-label' }, [
						n.component(new Txt(txtQuietRoll)),
					]),
					n.component(new Txt(c && c.name, { className: 'charlog--char' })),
					n.elem('span', { className: 'charlog--ooc' }, inner(n)),
				]),
			])
			: n => n.elem('div', { className: 'charlog--highlight' }, [
				n.component(new Txt(c && c.name, { className: 'charlog--char' })),
				n.elem('span', { className: 'charlog--tag' }, [ n.text(" roll") ]),
				n.elem('span', { className: 'charlog--ooc' }, inner(n)),
			]),
		);
	}

	get canHighlight() {
		return true;
	}
}

export default RollEventComponent;
