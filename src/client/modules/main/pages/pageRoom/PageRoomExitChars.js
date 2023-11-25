import { RootElem, Elem } from 'modapp-base-component';
import { CollectionComponent, CollectionList } from 'modapp-resource-component';
import { Collection, CollectionWrapper } from 'modapp-resource';
import ResizeObserverComponent from 'components/ResizeObserverComponent';

class PageRoomExitChars {
	constructor(module, chars) {
		this.module = module;
		this.chars = chars;
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
		this.elem = new ResizeObserverComponent(new RootElem('div', { className: 'pageroom-exitchars' }), (rect) => this._setComponent(rect));
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

	_setComponent(rect) {
		let el = this.elem?.getComponent().getElement();
		if (!el) return;

		let newPerRow = Math.max(Math.floor((rect.width + 4) / (24 + 4)), 1);
		if (newPerRow == this.perRow) return;

		// Dispose any previously rendered component
		this._disposeComponent();

		this.perRow = newPerRow;
		this.rows = new Collection({
			idAttribute: null,
			eventBus: this.module.self.app.eventBus,
		});
		this.component = new CollectionComponent(
			this.chars,
			new CollectionList(
				this.rows,
				row => new CollectionList(
					row,
					char => new Elem(n => n.elem('div', { className: 'pageroom-exitchars--char' }, [
						n.component(this.module.avatar.newAvatar(char, {
							size: 'tiny',
						})),
					])),
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

	_updateRows() {
		if (!this.rows) return;

		let rowCount = Math.ceil(this.chars.length / this.perRow);
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
				let row = new CollectionWrapper(this.chars, {
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
		}
	}
}

export default PageRoomExitChars;
