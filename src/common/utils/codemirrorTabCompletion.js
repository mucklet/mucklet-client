import { keymap } from '@codemirror/view';
import { StateField, StateEffect, Facet, combineConfig } from '@codemirror/state';

const tabCompleteEffect = StateEffect.define();

const tabCompletionConfig = Facet.define({
	combine(configs) {
		return combineConfig(configs, {
			complete: () => null,
		});
	},
});

const tabCompletionState = StateField.define({
	create() {
		return new TabCompletionState(false, null, null, null);
	},
	update(value, tr) {
		return value.update(tr);
	},
});

export function tabComplete(view) {
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
			},
		);
	}
	return true;
};

function tabCompletionKeymap(opt) {
	return keymap.of([
		{ key: opt.key || 'Tab', run: tabComplete },
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

/**
 * Merges two complete result sets and removed duplicates. If either a or b is
 * null or contains an empty list, the other result set is returned.
 * @param {string} text Text.
 * @param {import('types/interfaces/Completer').CompleteResult | null} a First result set.
 * @param {import('types/interfaces/Completer').CompleteResult | null} b Second result set.
 * @returns {import('types/interfaces/Completer').CompleteResult | null} A merged result set.
 */
export function mergeTabCompleteResults(text, a, b) {
	if (!a || !a.list?.length) {
		return b;
	}
	if (!b || !b.list?.length) {
		return a;
	}
	let list = [];
	let from = Math.min(a.from, b.from);
	let to = Math.max(a.to, b.to);
	let txts = {};
	// Run twice, first with a, then with b.
	for (let i = 0; i < 2; i++) {
		for (let v of a.list) {
			// Add prefix/suffix to match the extended from/to size.
			let txt = text.slice(from, a.from) + v + text.slice(a.to, to);
			// Add if not already included
			if (!txts[txt]) {
				list.push(txt);
				txts[txt] = true;
			}
		}
		a = b;
	}
	return { list, from, to };
}

/**
 * Adds the offset to the results to/from values.
 * @param {import('types/interfaces/Completer').CompleteResult | null} result Complete result.
 * @param {number} offset Offset position.
 * @returns {import('types/interfaces/Completer').CompleteResult | null} Offsetted complete result.
 */
export function offsetCompleteResults(result, offset) {
	return result
		? {
			list: result.list,
			from: result.from + offset,
			to: result.to + offset,
		}
		: result;
}
