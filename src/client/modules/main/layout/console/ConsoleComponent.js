import { Context, Elem, Txt } from 'modapp-base-component';
import { CollectionList, ModelComponent, CollectionComponent } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import FAIcon from 'components/FAIcon';
import SimpleBar from 'components/SimpleBar';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';
import counterString from 'utils/counterString';
import ConsoleControlledChar from './ConsoleControlledChar';
import ConsoleEditor from './ConsoleEditor';

class ConsoleComponent {
	constructor(module, model, layoutId) {
		this.module = module;
		this.model = model;
		this.layout = layoutId || 'desktop';
		this.editor = new ConsoleEditor(this.module, model.state);

		// Bind callbacks
		this.focus = this.focus.bind(this);
	}

	render(el) {
		this.module.self.on('focus', this.focus);

		this.elem = new ModelComponent(
			this.module.self.getModel(),
			new Elem(n => n.elem('div', { className: 'console console--layout' + this.layout }, [
				n.elem('div', { className: 'console--container' }, [
					n.elem('div', { className: 'console--controlled' }, [
						n.component(new CollectionComponent(
							this.module.player.getControlled(),
							new Collapser(),
							(col, c) => {
								c.setComponent(col.length > 1 || this.layout == 'desktop'
									? c.getComponent() || new Context(
										() => new CollectionWrapper(this.module.player.getControlled(), {
											compare: (a, b) => a.ctrlSince - b.ctrlSince,
											eventBus: this.module.self.app.eventBus,
										}),
										(ctrls) => ctrls.dispose(),
										(ctrls) => new CollectionList(
											ctrls,
											m => new ConsoleControlledChar(this.module, m, { onClick: this.focus, layout: this.layout }),
											{ className: 'console--controlledlist', horizontal: true },
										),
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
						n.elem('div', { className: 'console--main' }, [
							n.component('editor', new SimpleBar(this.editor, { className: 'console--editor', autoHide: false })),
							n.component(new CollectionComponent(
								this.module.player.getControlled(),
								new Fader(null, { className: 'console--counter' }),
								(col, c) => {
									if (col.length != 1 || this.layout == 'desktop') {
										c.setComponent(null);
										return;
									}
									let char = col.atIndex(0);
									c.setComponent(new ModelComponent(
										this.module.charLog.getUnseenTargeted(),
										new ModelComponent(
											this.module.charLog.getUnseen(),
											new Elem(n => n.elem('div', { className: 'counter' }, [
												n.component('txt', new Txt("")),
											])),
											(m, c) => {
												let l = m.props[char.id];
												c.getNode('txt').setText(counterString(l));
												c[l ? 'removeClass' : 'addClass']('hide');
											},
										),
										(m, c) => c.getComponent()[m.props[char.id] ? 'addClass' : 'removeClass']('alert'),
									));
								},
							)),
						]),
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
			this.module.self.off('focus', this.focus);
		}
	}

	focus() {
		this.editor.focus();
	}
}

export default ConsoleComponent;
