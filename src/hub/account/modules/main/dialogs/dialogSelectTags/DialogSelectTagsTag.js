import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import ToggleBox from 'components/ToggleBox';
import PopupTip from 'components/PopupTip';
import Collapser from 'components/Collapser';


class DialogSelectTagsTag {
	constructor(model, tag) {
		this.model = model;
		this.tag = tag;
	}

	render(el) {
		let popupTip = new PopupTip('', { position: 'left', className: 'popuptip--width-m' });
		this.elem = new ModelComponent(
			this.model,
			new Elem(n => n.elem('div', { className: 'flex-row pad12 pad-bottom-m' }, [
				n.elem('label', {
					className: 'dialogselecttags-tag--label flex-1 flex-row pad12 dialogselecttags-tag--type-' + this.tag.type,
				}, [
					n.elem('div', { className: 'flex-auto' }, [
						n.component('toggle', new ToggleBox(!!this.model.props[this.tag.id], {
							className: 'small',
							events: {
								click: (c, e) => {
									c.toggleNext();
									e.stopPropagation();
								},
							},
							values: [ false, true ],
							disableClick: true,
							onChange: v => {
								this.model.set({ [this.tag.id]: v ? this.tag : undefined });
							},
						})),
					]),
					n.component(new ModelTxt(this.tag, m => m.key, { className: 'flex-1 dialogselecttags-tag--key' })),
				]),
				n.elem('div', { className: 'flex-auto' }, [
					n.component(new ModelComponent(
						this.tag,
						new Collapser(null, { horizontal: true }),
						(m, c) => {
							popupTip.setTip(m.desc);
							c.setComponent(m.desc ? popupTip : null);
						},
					)),
				]),
			])),
			(m, c, change) => {
				if (change) {
					c.getNode('toggle').setValue(!!m.props[this.tag.id]);
				}
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

}

export default DialogSelectTagsTag;
