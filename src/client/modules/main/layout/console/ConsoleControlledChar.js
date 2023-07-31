import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import counterString from 'utils/counterString';

class ConsoleControlledChar extends Elem {
	constructor(module, char, opt) {
		super();
		opt = opt || {};
		this.module = module;
		this.char = char;
		let playerModel = this.module.player.getModel();
		this.setRootNode(n => n.component(new ModelComponent(
			playerModel,
			new Elem(n => n.elem('div', {
				className: 'console-controlledchar',
				attributes: { 'data-charid': this.char.id },
			}, [
				n.elem('button', {
					className: 'btn medium', events: {
						click: () => this._onClick(),
					},
				}, [
					n.component(this.module.avatar.newAvatar(this.char, { size: 'tiny', className: 'console-controlledchar--avatar' })),
					n.component(opt.layout == 'mobile' ? null : new ModelTxt(this.char, m => m.name)),
					n.component(new ModelComponent(
						this.module.charLog.getUnseenTargeted(),
						new ModelComponent(
							this.module.charLog.getUnseen(),
							new Elem(n => n.elem('div', { className: 'console-controlledchar--counter counter' }, [
								n.component('txt', new Txt("")),
							])),
							(m, c) => {
								let l = m.props[char.id];
								c.getNode('txt').setText(counterString(l));
								c[l ? 'removeClass' : 'addClass']('hide');
							},
						),
						(m, c) => c.getComponent()[m.props[char.id] ? 'addClass' : 'removeClass']('alert'),
					)),
				]),
			])),
			(m, c) => {
				if (this.char === m.activeChar) {
					c.addClass('active');
				} else {
					c.removeClass('active');
				}
			},
		)));

		this.onClick = opt.onClick;
	}

	_onClick() {
		let a = this.module.player.getActiveChar();
		// Look at self if already active
		if (a && a.id == this.char.id) {
			a.call('look', { charId: a.id });
		} else {
			this.module.player.setActiveChar(this.char.id);
		}

		if (this.onClick) {
			this.onClick(this);
		}
	}
}

export default ConsoleControlledChar;
