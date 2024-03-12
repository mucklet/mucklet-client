import { Txt, Elem } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import idleLevels, { getCharIdleLevel } from 'utils/idleLevels';

class PageRoomChar {
	constructor(module, ctrl, char) {
		this.module = module;
		this.ctrl = ctrl;
		this.char = char;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.char,
			new ModelComponent(
				null,
				new ModelComponent(
					this.ctrl.lookedAt,
					new Elem(n => n.elem('div', { className: 'pageroom-char' }, [
						n.elem('cont', 'div', { className: 'pageroom-char--cont' }, [
							n.elem('btn', 'div', { className: 'pageroom-char--badge badge btn margin4', events: {
								click: () => this._lookChar(),
							}}, [
								n.elem('div', { className: 'badge--select' }, [
									n.component(this.module.avatar.newAvatar(this.char, { size: 'small', className: 'badge--icon' })),
									n.elem('div', { className: 'badge--info' }, [
										n.elem('fullname', 'div', { className: 'pageroom-char--name badge--title badge--nowrap' }, [
											n.component('name', new Txt()),
											n.text(' '),
											n.component('surname', new Txt()),
										]),
										n.elem('div', { className: 'badge--text badge--nowrap' }, [
											n.component('status', new Txt()),
											n.component('gender', new Txt()),
											n.text(' '),
											n.component('species', new Txt()),
										]),
									]),

									n.component(new ModelComponent(
										this.module.charsAwake.getNotes(),
										new Elem(n => n.elem('div', { className: 'badge--tools' }, [
											n.elem('note', 'button', { className: 'pageroom-char--note iconbtn medium tinyicon', events: {
												click: (c, ev) => {
													this.module.dialogEditNote.open(this.char.id);
													ev.stopPropagation();
												},
											}}, [
												n.component(new FAIcon('file-text')),
											]),
										])),
										(m, c) => c[m.props[this.char.id] ? 'addNodeClass' : 'removeNodeClass']('note', 'hasnote'),
									)),
								]),
								n.elem('lfrp', 'div', { className: 'counter small highlight indent' }),
							]),
						]),
					])),
					(m, c) => c[m[this.char.id] ? 'addNodeClass' : 'removeNodeClass']('cont', 'looking'),
				),
				(m, c) => this._setTooltip(this.char, c.getComponent()),
			),
			(m, c, change) => {
				let sc = c.getComponent().getComponent();
				sc.getNode('name').setText(m.name);
				sc.getNode('surname').setText(m.surname);
				sc.getNode('gender').setText(firstLetterUppercase(m.gender));
				sc.getNode('species').setText(firstLetterUppercase(m.species));
				sc.getNode('status').setText(m.status ? '(' + m.status + ') ' : '');
				this._setTooltip(m, sc);
				sc[m.state == 'asleep' ? 'addNodeClass' : 'removeNodeClass']('btn', 'inactive');
				sc[m.type == 'puppet' ? 'addNodeClass' : 'removeNodeClass']('btn', 'highlight');
				let lvl = getCharIdleLevel(m);
				for (let l of idleLevels) {
					sc[lvl == l ? 'addNodeClass' : 'removeNodeClass']('fullname', l.className);
				}
				// Set lfrp marker
				sc[m.rp == 'lfrp' ? 'removeNodeClass' : 'addNodeClass']('lfrp', 'hide');
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

	_setTooltip(m, c) {
		let genderSpecies = (firstLetterUppercase(m.gender) + ' ' + firstLetterUppercase(m.species)).trim();
		let p = m.puppeteer;
		c.setNodeAttribute('btn', 'title', (m.name + ' ' + m.surname).trim() +
			(genderSpecies ? "\n" + genderSpecies : '') +
			(p ? "\n(" + (p.name + ' ' + p.surname).trim() + ")" : '') +
			(m.status ? "\n" + m.status : ''),
		);
	}

	_lookChar() {
		this.ctrl.call('look', { charId: this.char.id }).then(() => {
			this.module.charPages.openPanel();
		}).catch(err => this.module.toaster.openError(err));
	}
}

export default PageRoomChar;
