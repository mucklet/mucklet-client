import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import ToggleBox from 'components/ToggleBox';
import PopupTip from 'components/PopupTip';
import Collapser from 'components/Collapser';


class PageSelectTagsTag {
	constructor(model, tag, prefs) {
		this.model = model;
		this.tag = tag;
		this.prefs = prefs;
	}

	render(el) {
		let isRoleTag = !!(this.tag.role || this.tag.idRole);
		let popupTip = new PopupTip('', { position: 'left', className: 'popuptip--width-m' });
		this.elem = new ModelComponent(
			this.model,
			new Elem(n => n.elem('div', { className: 'flex-row pad12 pad-bottom-m' }, [
				n.elem('label', {
					className: 'pageselecttags-tag--label flex-1 flex-row pad12' + (isRoleTag ? ' roletag' : '')
				}, [
					n.elem('div', { className: 'flex-auto' }, [
						n.component('toggle', new ToggleBox(this._getValue(), {
							className: 'small',
							events: {
								click: (c, e) => {
									c.toggleNext();
									e.stopPropagation();
								}
							},
							values: isRoleTag ? [ null, 'like' ] : [ null, 'like', 'dislike' ],
							disableClick: true,
							onChange: v => {
								let o = {};
								for (let pref of this.prefs) {
									o[this.tag.id + '_' + pref.id] = pref.id == v
										? this.tag
										: undefined;
								}
								this.model.set(o);
							}
						})),
					]),
					n.component(new ModelTxt(this.tag, m => m.key, { className: 'flex-1 pageselecttags-tag--key' })),
				]),
				n.elem('div', { className: 'flex-auto' }, [
					n.component(new ModelComponent(
						this.tag,
						new Collapser(null, { horizontal: true }),
						(m, c) => {
							popupTip.setTip(m.desc);
							c.setComponent(m.desc ? popupTip : null);
						}
					))
				])
			])),
			(m, c, change) => {
				if (change) {
					c.getNode('toggle').setValue(this._getValue(), false);
				}
			}
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_getValue() {
		let p = this.model.props;
		for (let pref of this.prefs) {
			if (p[this.tag.id + '_' + pref.id]) {
				return pref.id;
			}
		}
		return null;
	}
}

export default PageSelectTagsTag;
