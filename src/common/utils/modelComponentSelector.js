import arraysEqual from './arraysEqual';

/**
 * @typedef {object} modelComponentSelectorComponent
 * @property {function} [component] Component to set.
 * @property {function} [factory] Component factory function. Ignored if a component property is set: function(model) -> Component
 * @property {function} [condition] Condition function if component is to be selected: function(model) -> boolean
 * @property {function} [hash] Callback that returns a value that determines if a new component should be created. Ignored if the factory property is not used: function(model) -> {*|Array.<*>}
 */

const defaultSetter = (c, component) => c?.setComponent(component);

function getSelected(components, m) {
	for (let c of components) {
		if (c && (!c.condition || c.condition(m))) {
			return c;
		}
	}
	return null;
}

function equalHash(a, b) {
	if (a === b) {
		return true;
	}

	// If array, we test each individual value.
	if (Array.isArray(a) && Array.isArray(b)) {
		return arraysEqual(a, b);
	}

	return false;
}

/**
 * Returns a function to be used as on change callback for ModelComponent
 * classes.
 *
 * The function will iterate over a set of component factories,
 * selecting the first that meets the condition, and setting it using a setter.
 *
 * If no component meets the condition, a null component will be set.
 *
 * If a subsequent model change callback results in the same component, no new
 * component will be set unless:
 * 1) The component uses a factory function.
 * 2) The component has a hash function.
 * 3) The hash function produces a different hash than previous.
 *
 * @param {Array.<modelComponentSelectorComponent>} components An array of selector component objects.
 * @param {object} [opt] Optional parameters.
 * @param {function} [opt.setter] Setter callback that sets the selected component: function(wrappedComponent, selectedComponent). Defaults to (c, component) => c.setComponent(component).
 * @returns {function} Callback function for ModelComponent onChange callback.
 */
export default function modelComponentSelector(components, opt) {
	let selected = null;
	let hash = null;
	let setter = opt?.setter || defaultSetter;

	return (m, c) => {
		// Find first component with a matching condition.
		let newSelected = getSelected(components, m);

		// Check if we have selected the same component
		if (selected === newSelected) {
			// No change if we don't have a hash function or a factory.
			if (!selected?.hash || selected.component || !selected.factory) {
				return;
			}

			// If the hash hasn't changed, we won't replace the component.
			let newHash = selected.hash(m);
			if (equalHash(hash, newHash)) {
				return;
			}
			hash = newHash;
		} else {
			selected = newSelected;
			hash = selected?.hash ? selected.hash(m) : null;
		}

		// Set new component
		setter(c, selected && (selected.component || (selected.factory && selected.factory(m))) || null);
	};
}
