import { CollectionComponent } from 'modapp-resource-component';
import Fader from './Fader';
import resourceComponentSelector from 'utils/resourceComponentSelector';

/**
 * CollectionFader extends CollectionComponent and wraps a Fader, selecting the
 * component to set using resourceComponentSelector.
 *
 * The CollectionFader will iterate over the list of selector component objects,
 * selecting the first with a condition that is true, and setting it. If no
 * component has its condition met, a null component will be set.
 *
 * If a subsequent collection event callback results in the same component, no
 * new component will be set unless all the following statements are true:
 * 1. The selected component object uses a factory function.
 * 2. The selected component object has a hash function.
 * 3. The hash function produces a different hash than previous.
 */
class CollectionFader extends CollectionComponent {

	/**
	 * Creates a new CollectionFader instance.
	 * @param {Collection} collection Collection object
	 * @param {Array.<resourceComponentSelectorComponent>} components An array of selector component objects.
	 * @param {object} [opt] Optional parameters for the underlying Fader component.
	 */
	constructor(collection, components, opt) {
		super(collection, new Fader(null, opt), resourceComponentSelector(components));
	}
}

export default CollectionFader;
