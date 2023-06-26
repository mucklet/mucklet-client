import { ModelComponent } from 'modapp-resource-component';
import Fader from './Fader';
import modelComponentSelector from 'utils/modelComponentSelector';

/**
 * ModelFader extends ModelComponent and wraps a Fader, selecting the component
 * to set using modelComponentSelector.
 *
 * The ModelFader will iterate over the list of selector component objects,
 * selecting the first with a condition that is true, and setting it.
 * If no component has its condition met, a null component will be set.
 *
 * If a subsequent model change callback results in the same component, no
 * new component will be set unless all the following statements are true:
 * 1. The selected component object uses a factory function.
 * 2. The selected component object has a hash function.
 * 3. The hash function produces a different hash than previous.
 */
class ModelFader extends ModelComponent {

	/**
	 * Creates a new ModelFader instance.
	 * @param {Model} model Model object
	 * @param {Array.<modelComponentSelectorComponent>} components An array of selector component objects.
	 * @param {object} [opt] Optional parameters for the underlying Fader component.
	 * @param {string} [opt.postrenderUpdate] Flag setting if call to update should be done after render. Defaults to false.
	 */
	constructor(model, components, opt) {
		super(model, new Fader(null, opt), modelComponentSelector(components));
	}
}

export default ModelFader;
