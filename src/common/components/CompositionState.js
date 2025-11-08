import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import apiStates, { getApiState } from 'utils/apiStates';
import FAIcon from './FAIcon';
import Fader from './Fader';
import './compositionState.scss';

const sizeClass = {
	small: ' compositionstate--small',
};

const taskRunProps = {
	node: 'taskRun',
};

const stateprops = {
	node: 'state',
};

/**
 * CompositionState is component that displays the composition state of a
 * project, such as a node or a realm.
 */
class CompositionState {

	/**
	 * Creates an instance of CompositionState
	 * @param {NodeModel|RealmModel} model Composition state model.
	 * @param {object} [opt] Optional parameters.
	 * @param {"realm"|"node"} [opt.type] Type of model. Defaults to "realm".
	 * @param {"medium"|"small"} [opt.size] Size of the state component. Defaults to "medium".
	 */
	constructor(model, opt) {
		this.opt = { ...opt, className: 'compositionstate' + (opt?.className ? ' ' + opt.className : '') + (sizeClass[opt?.size] || '') };
		this._taskRunProp = taskRunProps[opt?.type] || 'apiTaskRun';
		this._stateProp = stateprops[opt?.type] || 'apiState';

		this._icon = new FAIcon('circle');
		this._spinner = new Elem(n => n.elem('div', { className: 'spinner' }));

		this.setModel(model);
	}


	/**
	 * Gets the current set composition state model.
	 * @returns {NodeModel|RealmModel} Composition state model.
	 */
	getModel() {
		return this._model;
	}

	/**
	 * Sets the compositon state model.
	 * @param {NodeModel|RealmModel} model Composition state model.
	 * @returns {this}
	 */
	setModel(model) {
		model = model || null;
		if (this._model === model) return this;

		this._model = model;

		if (this.mc) {
			this.mc.setModel(this._model);
		}
		return this;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', this.opt, [
			n.component('fader', new Fader()),
			n.html('&nbsp;&nbsp;'),
			n.component('txt', new Txt('', { duration: 0 })),
		]));
		this.mc = new ModelComponent(
			this._model,
			new ModelComponent(
				null,
				this.elem,
				(m, c, change) => change && this._update(),
			),
			(m, c) => {
				c.setModel(m?.props[this._taskRunProp]);
				this._update();
			},
		);
		return this.mc.render(el);
	}

	unrender() {
		if (this.mc) {
			this.mc.unrender();
			this.mc = null;
			this.elem = null;
		}
	}

	_update() {
		let c = this.elem;
		if (!c) {
			return;
		}

		let txt = '';
		let taskRun = this._model?.props[this._taskRunProp];
		let fader = c.getNode('fader');
		if (taskRun && !taskRun.done) {
			txt = taskRun.stepNames[taskRun.currentStep];
			fader.setComponent(this._spinner);
		} else {
			let state = getApiState(this._model, this._stateProp);
			txt = state.text;
			for (let s of apiStates) {
				this._icon[state == s ? 'addClass' : 'removeClass'](s.className);
			}
			fader.setComponent(this._icon);
		}
		c.getNode('txt').setText(txt);
	}
}

export default CompositionState;
