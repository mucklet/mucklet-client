import { ViewPlugin, Decoration } from "@codemirror/view";
import { getToken } from "utils/codemirror";
import { formatTextTokens } from 'utils/formatText';


const formatterMark = Decoration.mark({ class: 'cmd--format-formatter' });
const emMark = Decoration.mark({ class: 'cmd--format-em' });
const strongMark = Decoration.mark({ class: 'cmd--format-strong' });
const oocMark = Decoration.mark({ class: 'cmd--format-ooc' });
const cmdMark = Decoration.mark({ class: 'cmd--format-cmd' });
const supMark = Decoration.mark({ class: 'cmd--format-sup' });
const subMark = Decoration.mark({ class: 'cmd--format-sub' });
const strikethroughMark = Decoration.mark({ class: 'cmd--format-strikethrough' });
const linkMark = Decoration.mark({ class: 'cmd--format-link' });

const tokenTypes = {
	// Span tokens
	'cmd_start': { end: 'cmd_end', mark: cmdMark, startMark: formatterMark, endMark: formatterMark },
	'em_start': { end: 'em_end', mark: emMark, startMark: formatterMark, endMark: formatterMark },
	'strong_start': { end: 'strong_end', mark: strongMark, startMark: formatterMark, endMark: formatterMark },
	'ooc_start': { end: 'ooc_end', mark: oocMark, startMark: formatterMark, endMark: formatterMark },
	'sup_start': { end: 'sup_end', outerMark: supMark, startMark: formatterMark, endMark: formatterMark },
	'sub_start': { end: 'sub_end', outerMark: subMark, startMark: formatterMark, endMark: formatterMark },
	'strikethrough_start': { end: 'strikethrough_end', mark: strikethroughMark, startMark: formatterMark, endMark: formatterMark },
	// Single token
	'anchor': { mark: linkMark },
};

// const boldMark = Decoration.mark({ attributes: { style: 'font-weight:bold;' }});
// const italicsMark = Decoration.mark({ attributes: { style: 'font-style:italic;' }});
// const strikethroughMark = Decoration.mark({ attributes: { style: 'text-decoration:line-through;' }});
// const oocMark = Decoration.mark({ attributes: { style: 'color:#696d77;' }});

function getItemById(a, id) {
	for (let o of a) {
		if (o.id == id) {
			return o;
		}
	}
}

const codemirrorFormattingSyntax = ViewPlugin.fromClass(class {
	constructor(view) {
		this.view = view;
		this.decorations = this._formattingSyntax();
	}

	update(update) {
		if (!update.docChanged) return;

		this.decorations = this._formattingSyntax();
	}

	_formattingSyntax() {
		let formattedTexts = [];
		// Collect total range of formattedText tokens
		getToken(this.view.state, token => {
			if (token.type) {
				let step = token.state.step;
				if (step && step.formatText) {
					let opt = step.formatText();
					if (opt?.id) {
						let ft = getItemById(formattedTexts, opt.id);
						if (!ft) {
							ft = { id: opt.id, from: token.from, to: token.to, opt };
							formattedTexts.push(ft);
						} else {
							if (ft.from > token.from) {
								ft.from = token.from;
							}
							if (ft.to < token.to) {
								ft.to = token.to;
							}
						}
					}
				}
			}
		});

		let set = [];
		if (formattedTexts.length) {
			let doc = this.view.state.doc;
			for (let ft of formattedTexts) {
				let str = doc.sliceString(ft.from, ft.to);

				let tokens = formatTextTokens(str, ft.opt);
				let stack = [];
				let pos = ft.from;
				for (let t of tokens) {
					// Check if token ends stacked span
					let len = t.content?.length || 0;
					if (stack.length) {
						let s = stack[stack.length - 1];
						let type = s.type;
						if (type.end == t.type) {
							// End of span
							if (type.startMark && s.len) {
								set.push(type.startMark.range(s.pos, s.pos + s.len));
							}
							if (type.mark && s.pos + s.len < pos) {
								set.push(type.mark.range(s.pos + s.len, pos));
							}
							if (type.outerMark && s.pos < pos + len) {
								set.push(type.outerMark.range(s.pos, pos + len));
							}
							if (type.endMark && len) {
								set.push(type.endMark.range(pos, pos + len));
							}
							stack.pop();
						}
					}

					// Check if it is a token to act upon
					let type = tokenTypes[t.type];
					if (type) {
						// Check if it is a span token. If so, we put it on the stack.
						if (type.end) {
							// Spanning token. Put it on the stack.
							stack.push({ pos, len, type });
						} else if (len) {
							// Single token. Generate a decoration.
							set.push(type.mark.range(pos, pos + len));
						}
					} else if (stack.length) {
						let s = stack[stack.length - 1];
						if (s.type.end == t.type) {
							// End of span

						}
					}
					pos += len;
				}
			}
		}
		set.sort((a, b) => a.from - b.from);
		return Decoration.set(set);
	}
}, {
	decorations: v => v.decorations,
});

export default codemirrorFormattingSyntax;
