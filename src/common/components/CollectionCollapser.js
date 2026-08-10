import { CollectionComponent } from 'modapp-resource-component';
import Collapser from './Collapser';
import resourceComponentSelector from 'utils/resourceComponentSelector';

/**
 * CollectionCollapser extends CollectionComponent and wraps a Collapser,
 * selecting the component to set using resourceComponentSelector.
 *
 * The CollectionCollapser will iterate over the list of selector component
 * objects, selecting the first with a condition that is true, and setting it.
 * If no component has its condition met, a null component will be set.
 *
 * If a subsequent collection event callback results in the same component, no
 * new component will be set unless all the following statements are true:
 * 1. The selected component object uses a factory function.
 * 2. The selected component object has a hash function.
 * 3. The hash function produces a different hash than previous.
 */
class CollectionCollapser extends CollectionComponent {

	/**
	 * Creates a new CollectionCollapser instance.
	 * @param {Collection} collection Collection object
	 * @param {Array.<resourceComponentSelectorComponent>} components An array of selector component objects.
	 * @param {object} [opt] Optional parameters for the underlying Collapser component.
	 */
	constructor(collection, components, opt) {
		super(collection, new Collapser(null, opt), resourceComponentSelector(components));
	}
}

export default CollectionCollapser;
