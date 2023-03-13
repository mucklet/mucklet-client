import { Elem } from 'modapp-base-component';
import { CollectionList, ModelComponent, CollectionComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import SimpleBar from 'components/SimpleBar';
import Collapser from 'components/Collapser';
import ConsoleControlledChar from './ConsoleControlledChar';
import ConsoleEditor from './ConsoleEditor';

class ConsoleComponent {
	constructor(module, model, layoutId) {
		this.module = module;
		this.model = model;
		this.layout = layoutId || 'desktop';
		this.editor = new ConsoleEditor(this.module, model.state);

		// Bind callbacks
		this._onClick = this._onClick.bind(this);
	}

	render(el) {

		let components = {};
		this.elem = new ModelComponent(
			this.module.self.getModel(),
			new Elem(n => n.elem('div', { className: 'console console--layout' + this.layout }, [
				n.elem('div', { className: 'console--container' }, [
					n.elem('div', { className: 'console--controlled' }, [
						n.component(new CollectionComponent(
							this.module.player.getControlled(),
							new Collapser(),
							(col, c) => {
								c.setComponent(components.controlled = col.length > 1 || this.layout == 'desktop'
									? components.controlled || new CollectionList(
										this.module.player.getControlled(),
										m => new ConsoleControlledChar(this.module, m, { onClick: this._onClick, layout: this.layout }),
										{ className: 'console--controlledlist', horizontal: true },
									)
									: null,
								);
							},
						)),
					]),
					n.elem('div', { className: 'console--editorcont' }, [
						n.elem('div', { className: 'console--sendtools console--touchonly' }, [
							n.elem('button', {
								className: 'console--toolbtnfull iconbtn small primary',
								events: {
									click: (c, e) => {
										this.editor.send();
										this.editor.focus();
										e.stopPropagation();
									},
								},
							}, [
								n.component(new FAIcon('paper-plane')),
							]),
						]),
						n.component(new ModelComponent(
							this.model,
							new ModelComponent(
								null,
								new Elem(n => n.elem('div', { className: 'console--historytools' }, [
									n.elem('cyclePrev', 'button', {
										className: 'console--toolbtn iconbtn small',
										events: {
											click: (c, e) => {
												this.editor.cyclePrev();
												this.editor.focus();
												e.stopPropagation();
											},
										},
									}, [
										n.component(new FAIcon('caret-up')),
									]),
									n.elem('button', {
										className: 'console--toolbtn console--touchonly iconbtn small',
										events: {
											click: (c, e) => {
												this.editor.tabComplete();
												this.editor.focus();
												e.stopPropagation();
											},
										},
									}, [
										n.component(new FAIcon('step-forward')),
									]),
									n.elem('cycleNext', 'button', {
										className: 'console--toolbtn iconbtn small',
										events: {
											click: (c, e) => {
												this.editor.cycleNext();
												this.editor.focus();
												e.stopPropagation();
											},
										},
									}, [
										n.component(new FAIcon('caret-down')),
									]),
								])),
								(m, c) => {
									c.setNodeProperty('cyclePrev', 'disabled', m && m.historyIdx ? null : 'disabled');
									c.setNodeProperty('cycleNext', 'disabled', !m || (m.historyIdx >= m.historyLength && m.isClean) ? 'disabled' : null);
								},
							),
							(m, c) => {
								c.setModel(m.state);
								this.editor.setState(m.state);
							},
						)),
						n.component('editor', new SimpleBar(this.editor, { className: 'console--editor', autoHide: false })),
					]),
				]),
			])),
			(m, c) => c[m.mode == 'touch' ? 'addClass' : 'removeClass']('console--touch'),
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onClick() {
		if (!this.elem) return;

		let editor = this.elem.getNode('editor');
		if (editor) {
			// editor.getComponent().focus();
		}
	}
}

export default ConsoleComponent;
