/**
 * Listens or unlistens to a model. If a callback is provided, it will listen/unlisten to change on the model, using the callback.
 * @param {Model} model Model object.
 * @param {boolean} [on] Listens if true, otherwise unlistens. Defaults to true.
 * @param {function} [onChange] Callback function to call on change.
 * @returns {Model} Model being listened to.
 */
export default function listenModel(model, on, onChange) {
	if (model) {
		let method = on || typeof on == 'undefined' ? 'on' : 'off';
		if (typeof model[method] == 'function') {
			if (onChange) {
				model[method]('change', onChange);
			} else {
				model[method]();
			}
		}
	}
	return model;
}

/**
 * Unlistens to one model and starts listening to a second. If a callback is provided, it will listen/unlisten to change on the model, using the callback.
 * @param {Model} oldModel Model object to stop listening to.
 * @param {Model} newModel Model object to start listening to.
 * @param {function} [onChange] Callback function to call on change.
 * @returns {Model?} Model being listened to, or null if no model was provided;
 */
export function relistenModel(oldModel, newModel, onChange) {
	newModel = newModel || null;
	if (oldModel !== newModel) {
		listenModel(oldModel, false, onChange);
		listenModel(newModel, true, onChange);
	}
	return newModel;
}
