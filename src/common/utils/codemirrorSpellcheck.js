import { ViewPlugin, Decoration } from '@codemirror/view';
import { getToken } from './codemirror';

const spellcheckMark = Decoration.mark({ attributes: { spellcheck: 'true' }});

const codemirrorSpellcheck = ViewPlugin.fromClass(class {
	constructor(view) {
		this.view = view;
		this.decorations = this._spellchecks();
	}

	update(update) {
		if (!update.docChanged) return;

		this.decorations = this._spellchecks();
	}

	_spellchecks() {
		let set = [];
		getToken(this.view.state, token => {
			if (token.type) {
				let step = token.state.step;
				if (step && step.spellcheck) {
					set.push(spellcheckMark.range(token.from, token.to));
				}
			}
		});
		return Decoration.set(set);
	}
}, {
	decorations: v => v.decorations
});

export default codemirrorSpellcheck;
