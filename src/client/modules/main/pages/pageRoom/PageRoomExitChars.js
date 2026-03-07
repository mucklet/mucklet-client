import { RootElem, Elem, Txt } from 'modapp-base-component';
import { CollectionComponent, CollectionList, ModelComponent } from 'modapp-resource-component';
import { Collection, CollectionWrapper } from 'modapp-resource';
import ResizeObserverComponent from 'components/ResizeObserverComponent';
import * as tooltip from 'utils/tooltip';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import idleLevels, { getCharIdleLevel } from 'utils/idleLevels';

class PageRoomExitChars {
	constructor(module, chars, opt = {}) {
		this.module = module;
		this.chars = chars;
		this.opt = opt;
		this.perRow = 0;
		this.elem = null;
		this.rows = null;
		this.component = null;
	}

	render(el) {
		this.rows = new Collection({
			idAttribute: null,
			eventBus: this.module.self.app.eventBus,
		});
		this.elem = new ResizeObserverComponent(new RootElem('div', { className: 'pageroom-exitchars' }), (rect, oldRect) => {
			if (oldRect) {
				requestAnimationFrame(() => this._setComponent());
			} else {
				this._setComponent();
			}
		});
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this._disposeComponent();
			this.elem.unrender();
			this.elem = null;
			this.perRow = 0;
		}
	}

	_setComponent() {
		let el = this.elem?.getComponent().getElement();
		if (!el) return;

		let newPerRow = Math.max(Math.floor((el.offsetWidth + 4) / (24 + 4)), 1);
		if (newPerRow == this.perRow) return;

		// Dispose any previously rendered component
		this._disposeComponent();

		this.perRow = newPerRow;
		this.rows = new Collection({
			idAttribute: null,
			eventBus: this.module.self.app.eventBus,
		});
		// Filter out highly idle characters (away/idle level 3)
		this.filteredChars = new CollectionWrapper(this.chars, {
			filter: ch => ch.idle !== 3,
			eventBus: this.module.self.app.eventBus,
		});
		this.component = new CollectionComponent(
			this.filteredChars,
			new CollectionList(
				this.rows,
				row => new CollectionList(
					row,
					char => new ModelComponent(
						char,
						new Elem(n => n.elem('div', {
							className: 'pageroom-exitchars--char' + (this.opt.clickTooltip ? '' : ' common--tooltip'),
							events: {
								click: (c, ev) => {
									if (this.opt.clickTooltip) {
										this._onClick(c.getNode('cont'), char);
										ev.stopPropagation();
									}
								},
							},
						}, [
							n.elem('cont', 'div', [
								n.component(this.module.avatar.newAvatar(char, {
									size: 'tiny',
								})),
							]),
						])),
						(m, c) => {
							if (!this.opt.clickTooltip) {
								let genderSpecies = (m.gender + ' ' + m.species).trim();
								c.setAttribute('title', m.name + ' ' + m.surname + (genderSpecies ? '\n' + genderSpecies : ''));
							}
						},
					),
					{
						className: 'pageroom-exitchars--row',
						horizontal: true,
					},
				),
			),
			(chars) => this._updateRows(),
		);
		this.component.render(el);
	}

	_onClick(el, char) {
		if (!el) {
			return;
		}

		let nameComponent = new Txt();
		let surnameComponent = new Txt();
		let genderComponent = new Txt();
		let speciesComponent = new Txt();

		this.tooltip = tooltip.click(
			el,
			new ModelComponent(
				char,
				new Elem(n => n.elem('div', { className: 'pageroom-exitchars--tooltip' }, [
					n.elem('fullname', 'div', { className: 'pageroom-exitchars--fullname' }, [
						n.component(nameComponent),
						n.text(' '),
						n.component(surnameComponent),
					]),
					n.elem('div', { className: '' }, [
						n.component(genderComponent),
						n.text(' '),
						n.component(speciesComponent),
					]),
				])),
				(m, c) => {
					nameComponent.setText(m.name);
					surnameComponent.setText(m.surname);
					genderComponent.setText(firstLetterUppercase(m.gender));
					speciesComponent.setText(firstLetterUppercase(m.species));
					let lvl = getCharIdleLevel(m);
					for (let l of idleLevels) {
						c[lvl == l ? 'addNodeClass' : 'removeNodeClass']('fullname', l.className);
					}
				},
			),
			{
				margin: 'xs',
				padding: 'm',
				position: 'bottom',
				size: 'auto',
				onClose: () => {
					this.tooltip = null;
				},
			},
		);
	}

	_updateRows() {
		if (!this.rows) return;

		let rowCount = Math.ceil(this.filteredChars.length / this.perRow);
		let currentCount = this.rows.length;

		if (rowCount == currentCount) {
			return;
		}

		if (rowCount < currentCount) {
			 for (let i = currentCount - 1; i >= rowCount; i--) {
				let row = this.rows.removeAtIndex(i);
				row.dispose();
			 }
		} else {
			for (let i = currentCount; i < rowCount; i++) {
				let row = new CollectionWrapper(this.filteredChars, {
					begin: i * this.perRow,
					end: (i + 1) * this.perRow,
					eventBus: this.module.self.app.eventBus,
				});
				this.rows.add(row, i);
			}
		}
	}

	_disposeComponent() {
		if (this.component) {
			this.component.unrender();
			this.component = null;
			for (let row of this.rows) {
				row.dispose();
			}
			this.rows = null;
			if (this.filteredChars) {
				this.filteredChars.dispose();
				this.filteredChars = null;
			}
		}
	}
}

export default PageRoomExitChars;
