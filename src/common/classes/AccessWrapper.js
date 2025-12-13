import { ModelComponent } from 'modapp-resource-component';
import ModelCollapser from 'components/ModelCollapser';
import ModelFader from 'components/ModelFader';

/**
 * AccessWrapper is a helper class that has functions that can wrap components
 * and set them as disabled or hidden depending on the values of an access
 * model.
 */
class AccessWrapper {

	/**
	 * Creates an AccessWrapper instance.
	 * @param {Model} model Access model.
	 * @param {(model: Model) => bool} condition Access condition callback. If return value is true, access is granted.
	 */
	constructor(model, condition) {
		this.setModel(model);
		this._condition = condition;
	}

	/**
	 * Sets the model.
	 * @param {Model} model Access model.
	 */
	setModel(model) {
		this._model = model || null;
	}

	/**
	 * Creates a ModelComponent wrapper that calls component.setProperty() and
	 * sets it to 'disabled' if the access condition is false. If no access
	 * model is provided, it leaves the component unwrapped.
	 *
	 * If the component doesn't have a setProperty method, it will try to call
	 * component.getComponent().setProperty() instead.
	 * @param {Component} component Component to wrap.
	 * @returns {Component} Wrapped component.
	 */
	disable(component) {
		return this._model
			? new ModelComponent(
				this._model,
				component,
				(m, c) => c.setProperty
					? c.setProperty('disabled', !this._condition(m))
					: c.getComponent().setProperty('disabled', !this._condition(m)),
			)
			: component;
	}

	/**
	 * Creates a ModelComponent wrapper that calls component.setStyle() and sets
	 * display:none if the access condition is false. If no access model is
	 * provided, it leaves the component unwrapped.
	 *
	 * If the component doesn't have a setStyle method, it will try to call
	 * component.getComponent().setStyle() instead.
	 * @param {Component} component Component to wrap.
	 * @returns {Component} Wrapped component.
	 */
	hide(component) {
		return this._model
			? new ModelComponent(
				this._model,
				component,
				(m, c) => c.setStyle
					? c.setStyle('display', this._condition(m) ? null : 'none')
					: c.getComponent().setStyle('display', this._condition(m) ? null : 'none'),
			)
			: component;
	}

	/**
	 * Creates a ModelCollapser wrapper that collapses the component if the
	 * access condition is false. If no access model is provided, it leaves the
	 * component unwrapped.
	 * @param {Component} component Component to wrap.
	 * @returns {Component} Wrapped component.
	 */
	collapse(component) {
		return this._model
			? new ModelCollapser(this._model, [{
				component,
				condition: m => this._condition(m),
			}])
			: component;
	}

	/**
	 * Creates a ModelFader wrapper that fades out the component if the access
	 * condition is false. If no access model is provided, it leaves the
	 * component unwrapped.
	 * @param {Component} component Component to wrap.
	 * @returns {Component} Wrapped component.
	 */
	fade(component) {
		return this._model
			? new ModelFader(this._model, [{
				component,
				condition: m => this._condition(m),
			}])
			: component;
	}

	/**
	 * Creates a ModelComponent wrapper that calls component.toggleActive() and sets
	 * the component to active if the access condition is false. If no access model is
	 * provided, it leaves the component unwrapped.
	 *
	 * If the component doesn't have a toggleActive method, it will try to call
	 * component.getComponent().toggleActive() instead.
	 * @param {Component} component Component to wrap.
	 * @returns {Component} Wrapped component.
	 */
	inactivate(component) {
		return this._model
			? new ModelComponent(
				this._model,
				component,
				(m, c) => c.toggleActive
					? c.toggleActive(!!this._condition(m))
					: c.getComponent().toggleActive(!!this._condition(m)),
			)
			: component;
	}

	/**
	 * Creates a ModelComponent wrapper that adds a class by calling
	 * component.addClass() or component.removeClass() if the access condition
	 * is false. If no access model is provided, it leaves the component
	 * unwrapped.
	 *
	 * If the component doesn't have a addClass/removeClass method, it will try to call
	 * component.getComponent().addClass/removeClass() instead.
	 * @param {string} className Class name to set.
	 * @param {Component} component Component to wrap.
	 * @returns {Component} Wrapped component.
	 */
	setClass(className, component) {
		return this._model
			? new ModelComponent(
				this._model,
				component,
				(m, c) => {
					let method = this._condition(m) ? 'removeClass' : 'addClass';
					c[method]
						? c[method](className)
						: c.getComponent()[method](className);
				},
			)
			: component;
	}
}

export default AccessWrapper;
