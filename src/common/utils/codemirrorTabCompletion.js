import { keymap } from '@codemirror/view';
import { StateField, StateEffect, Facet, combineConfig } from '@codemirror/state';

const tabCompleteEffect = StateEffect.define();

const tabCompletionConfig = Facet.define({
	combine(configs) {
		return combineConfig(configs, {
			complete: () => null,
		});
	}
});

const tabCompletionState = StateField.define({
	create() {
		return new TabCompletionState(false, null, null, null);
	},
	update(value, tr) {
		return value.update(tr);
	}
});

function tabComplete(view) {
	let tr = view.state.update({ effects: tabCompleteEffect.of(null) });
	let cState = tr.state.field(tabCompletionState, false);
	if (cState && cState.active) {
		view.dispatch(tr);

		let result = cState.result;
		let last = cState.last;
		let current = cState.current;
		let apply = result.list[current];

		view.dispatch(
			{
				changes: { from: result.from, to: last === null ? result.to : result.from + last.length, insert: apply },
				selection: { anchor: result.from + apply.length },
				userEvent: "input.tabcomplete",
			}
		);
	}
	return true;
};

function tabCompletionKeymap(opt) {
	return keymap.of([
		{ key: opt.key || 'Tab', run: tabComplete }
	]);
}

class TabCompletionState {
	constructor(active, result, last, current) {
		this.active = active;
		this.result = result;
		this.last = last;
		this.current = current;
	}

	update(tr) {
		let updated = null;
		for (let effect of tr.effects) {
			if (effect.is(tabCompleteEffect)) {
				updated = this.tabComplete(tr);
			}
		}

		// Reset tab completion when changing selection or editing the document
		if ((tr.selection || tr.docChanged) && !tr.isUserEvent("input.tabcomplete")) {
			updated = updated || new TabCompletionState(false, null, null, null);
		}

		return updated || this;
	}

	tabComplete(tr) {
		let last = null;
		let current = 0;
		let result = this.result;
		if (this.active) {
			last = result.list[this.current];
			current = (this.current + 1) % result.list.length;
		} else {
			let cfg = tr.state.facet(tabCompletionConfig);
			// Try get a new list of complete results
			result = cfg.complete(tr.state);
			// No results means no completion
			if (!result || !result.list || !result.list.length) {
				return this;
			}
		}

		return new TabCompletionState(true, result, last, current);
	}
}


export default function consoleTabCompletion(cfg) {
	cfg = cfg || {};
	return [
		tabCompletionConfig.of(cfg),
		tabCompletionState,
		tabCompletionKeymap(cfg),
	];
};
