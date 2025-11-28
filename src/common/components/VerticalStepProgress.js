import { Elem, Context } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import './verticalStepProgress.scss';

const states = {
	completed: true,
	warning: true,
	error: true,
};

/**
 * VerticalStepProgress is a vertical progress bar with circles for each step.
 */
class VerticalStepProgress extends CollectionList {

	/**
	 * Creates an instance of VerticalStepProgress
	 * @param {Collection} collection A collection of steps.
	 * @param {(step: any) => (boolean | "completed" | "warning" | "error")} isCompleted A callback to test if a step is completed. True is equal to "completed".
	 * @param {(step: any) => Component} componentFactory A callback that returns a component to show next to each step.
	 * @param {object} [opt] Optional parameters.
	 * @param {module:modapp~EventBus} [opt.eventBus] Event bus.
	 */
	constructor(collection, isCompleted, componentFactory, opt) {
		super(collection, (step) => new Context(
			() => step,
			null,
			ctx => new Elem(n => n.elem('div', { className: 'verticalstepprogress--step' }, [
				n.component(componentFactory?.(step)),
			])),
		), {
			...opt,
			tagName: 'ul',
			className: 'verticalstepprogress' + (opt?.className ? ' ' + opt.className : ''),
			subTagName: 'li',
		});

		this._isCompleted = isCompleted;
	}

	render(el) {
		let rel = super.render(el);
		this.update();
		return rel;
	}

	update() {
		let len = this.getCollection()?.length || 0;
		let lastComp = null;
		for (let i = 0; i < len; i++) {
			let c = this.getComponent(i);
			let completed = (c && this._isCompleted?.(c.getContext()));
			completed = typeof completed == 'string'
				? states[completed]
					? completed
					: ''
				: completed
					? 'completed'
					: '';
			let comp = c?.getComponent();
			if (comp) {
				for (let k in states) {
					comp[k == completed ? 'addClass' : 'removeClass'](k);
				}
			}
			lastComp?.[completed ? 'addClass' : 'removeClass']('nextcompleted');
			lastComp = comp;
		}
	}
}

export default VerticalStepProgress;
