import { Elem } from 'modapp-base-component';
import { CollectionList, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import SimpleBar from 'components/SimpleBar';
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

		this.elem = new Elem(n => n.elem('div', { className: 'console console--layout' + this.layout }, [
			n.elem('div', { className: 'console--container' }, [
				n.elem('div', { className: 'console--controlled' }, [
					n.component(new CollectionList(
						this.module.player.getControlled(),
						m => new ConsoleControlledChar(this.module, m, { onClick: this._onClick, layout: this.layout }),
						{ className: 'console--controlledlist', horizontal: true },
					)),
				]),
				n.elem('div', { className: 'console--editorcont' }, [
					n.component(new ModelComponent(
						this.model,
						new ModelComponent(
							null,
							new Elem(n => n.elem('div', { className: 'console--tools' }, [
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
		]));
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
