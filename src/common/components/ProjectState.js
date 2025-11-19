import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import projectStates, { getProjectState } from 'utils/projectStates';
import FAIcon from './FAIcon';
import Fader from './Fader';
import './projectState.scss';

const sizeClass = {
	small: ' projectstate--small',
};

/**
 * ProjectState is component that displays the state of a project, such as a
 * node or a realm.
 */
class ProjectState {

	/**
	 * Creates an instance of ProjectState
	 * @param {NodeModel|RealmModel} model Project state model.
	 * @param {object} [opt] Optional parameters.
	 * @param {"medium"|"small"} [opt.size] Size of the state component. Defaults to "medium".
	 */
	constructor(model, opt) {
		this.opt = { ...opt, className: 'projectstate' + (opt?.className ? ' ' + opt.className : '') + (sizeClass[opt?.size] || '') };
		this._taskRunProp = 'taskRun';
		this._stateProp = 'state';

		this._icon = new FAIcon('circle');
		this._spinner = new Elem(n => n.elem('div', { className: 'spinner' }));

		this.setModel(model);
	}


	/**
	 * Gets the current set project state model.
	 * @returns {NodeModel|RealmModel} Project state model.
	 */
	getModel() {
		return this._model;
	}

	/**
	 * Sets the compositon state model.
	 * @param {NodeModel|RealmModel} model Project state model.
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
			let state = getProjectState(this._model, this._stateProp);
			txt = state.text;
			for (let s of projectStates) {
				this._icon[state == s ? 'addClass' : 'removeClass'](s.className);
			}
			fader.setComponent(this._icon);
		}
		c.getNode('txt').setText(txt);
	}
}

export default ProjectState;
