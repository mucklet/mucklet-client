import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
// import Collapser from 'components/Collapser';
// import PageAwakeCharContent from './PageAwakeCharContent';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import idleLevels from 'utils/idleLevels';

class PageAwakeChar {
	constructor(module, char) { // }, model) {
		this.module = module;
		this.char = char;
		// this.model = model;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.char,
			new ModelComponent(
				null,
				new Elem(n => n.elem('div', { className: 'pageawake-char' }, [
					n.elem('badge', 'div', { className: 'pageawake-char--badge badge btn margin4', events: {
						click: (c, ev) => {
							this.module.dialogAboutChar.open(this.char);
							ev.stopPropagation();
						}
					}}, [
						n.elem('div', { className: 'badge--select' }, [
							n.component(this.module.avatar.newAvatar(this.char, { size: 'small', className: 'badge--icon' })),
							n.elem('div', { className: 'badge--info' }, [
								n.elem('fullname', 'div', { className: 'pageawake-char--name badge--title badge--nowrap' }, [
									n.component('name', new Txt()),
									n.text(' '),
									n.component('surname', new Txt())
								]),
								n.elem('div', { className: 'badge--text badge--nowrap' }, [
									n.component('status', new Txt('')),
									n.component('gender', new Txt()),
									n.text(' '),
									n.component('species', new Txt())
								]),
							]),
							n.component(new ModelComponent(
								this.module.charsAwake.getNotes(),
								new Elem(n => n.elem('div', { className: 'badge--tools' }, [
									n.elem('note', 'button', { className: 'pageawake-char--note iconbtn medium tinyicon', events: {
										click: (c, ev) => {
											this.module.dialogEditNote.open(this.char);
											ev.stopPropagation();
										}
									}}, [
										n.component(new FAIcon('file-text')),
									])
								])),
								(m, c) => c[m.props[this.char.id] ? 'addNodeClass' : 'removeNodeClass']('note', 'hasnote')
							))
						]),
						// n.component(new ModelComponent(
						// 	this.model,
						// 	new Collapser(null),
						// 	(m, c, change) => {
						// 		if (change && !change.hasOwnProperty('selectedCharId')) return;
						// 		c.setComponent(m.selectedCharId === this.char.id
						// 			? new PageAwakeCharContent(this.module, this.char, (show) => this._toggleInfo(show))
						// 			: null
						// 		);
						// 	}
						// ))
					])
				])),
				(m, c) => this._setTooltip(this.char, c)
			),
			(m, c) => {
				c.setModel(m.puppeteer);
				c = c.getComponent();
				c.getNode('name').setText(m.name);
				c.getNode('surname').setText(m.surname);
				c.getNode('gender').setText(firstLetterUppercase(m.gender));
				c.getNode('species').setText(firstLetterUppercase(m.species));
				c.getNode('status').setText(m.status ? '(' + m.status + ') ' : '');
				this._setTooltip(m, c);

				c[m.match ? 'removeNodeClass' : 'addNodeClass']('badge', 'inactive');
				c[m.type == 'puppet' ? 'addNodeClass' : 'removeNodeClass']('badge', 'highlight');
				for (let i = 0; i < idleLevels.length; i++) {
					let lvl = idleLevels[i];
					c[i == m.idle ? 'addNodeClass' : 'removeNodeClass']('fullname', lvl.className);
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

	_setTooltip(m, c) {
		let genderSpecies = (firstLetterUppercase(m.gender) + ' ' + firstLetterUppercase(m.species)).trim();
		let p = m.puppeteer;
		c.setNodeAttribute('badge', 'title', (m.name + ' ' + m.surname).trim() +
			(genderSpecies ? "\n" + genderSpecies : '') +
			(p ? "\n(" + (p.name + ' ' + p.surname).trim() + ")" : '') +
			(m.status ? "\n" + m.status : '')
		);
	}

	// _toggleInfo(show) {
	// 	show = typeof show == 'undefined'
	// 		? !this.model.selectedCharId || this.model.selectedCharId != this.char.id
	// 		: !!show;

	// 	this.model.set({ selectedCharId: show ? this.char.id : null });
	// }
}

export default PageAwakeChar;
