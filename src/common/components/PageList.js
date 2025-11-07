import { Elem, Txt, Context, Transition } from 'modapp-base-component';
import { ModelTxt, CollectionList, ModelComponent, CollectionComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import FAIcon from './FAIcon';
import Fader from './Fader';
import Collapser from './Collapser';
import './pageList.scss';

const defaultLimit = 10;

/**
 * A list of items that can be browsed through pagination.
 */
export default class PageList {

	/**
	 * Creates a new PageList instance
	 * @param {object} opt Optional parameters
	 * @param {(offset: number, limit: number) => Promise<{ items: T[], total? : number | null}>} [opt.fetch] Fetch data callback function.
	 * @param {(offset: number, limit: number) => Promise<T[] | Collection<T>>} [opt.fetchCollection] Fetch collection callback function.
	 * @param {(item: T) => Component} [opt.componentFactory] Entry component factory function.
	 * @param {string} [opt.className] Component class name.
	 * @param {string} [opt.buttonClassName] Button class name.
	 * @param {string} [opt.headClassName] Head class name.
	 * @param {string} [opt.listClassName] List class name.
	 * @param {(item: T) => string} [opt.listSubClassName] List sub class name.
	 * @param {string} [opt.itemName] itemName
	 * @param {string | LocaleString} [opt.placeholder] Placeholder text when no entries are found.
	 * @param {number} [opt.page] Current page starting from 0.
	 * @param {number} [opt.limit] Limit of entries to show on a page.
	 * @param {number} [opt.total] Total entries.
	 * @param {Component} [opt.listHeaderComponent] List header component
	 */
	constructor(opt = {}) {
		this.opt = opt;

		this.model = new Model({ data: {
			offset: 0,
			fetchingOffset: null,
			count: 0,
			items: null,
			total: null,
		}});

		if (opt.page) {
			this.model.set({ offset: opt.page * (opt.limit || defaultLimit) });
		}
	}

	render(el) {
		const limit = this.opt.limit || defaultLimit;
		const noItemsComponent = new Txt(this.opt.placeholder || l10n.l('pageList.noItems', "Nothing to show"), { className: 'pagelist--noitems' });
		const itemCountComponent = new Elem(n => n.elem('div', { className: 'pagelist--page' }, [
			n.component(new Txt(this.opt.itemName || l10n.l('pageList.showing', "Showing"))),
			n.text(' '),
			n.component(new ModelTxt(this.model, m => m.props.offset + 1)),
			n.text(" – "),
			n.component(new ModelTxt(this.model, (m, c) => m.props.count
				? m.props.offset + (m.props.count > limit ? limit : m.props.count)
				: c.getText(),
			)),
			n.component(new ModelTxt(this.model, (m, _c) => m.props.total != null
				? l10n.l('pageList.ofTotal', " of {total}", { total: m.props.total })
				: '',
			)),
		]));

		const buttonClassName = 'iconbtn medium' + (this.opt.buttonClassName ? ' ' + this.opt.buttonClassName : '');

		this.elem = new Elem(n => n.elem('div', { className: 'pagelist' + (this.opt.className ? ' ' + this.opt.className : '') }, [
			n.component(new ModelComponent(
				this.model,
				new CollectionComponent(
					null,
					new Elem(n => n.elem('div', { className: 'pagelist--head flex-row flex-center margin8' + (this.opt.headClassName ? ' ' + this.opt.headClassName : '') }, [
						n.component(new ModelComponent(
							this.model,
							new Fader(null, { className: 'flex-1' }),
							(m, c) => c.setComponent(m.props.items
								? m.props.count || m.props.offset // If we have item, or are on a later page.
									? itemCountComponent
									: noItemsComponent
								: null,
							),
						)),
						n.component(new ModelComponent(
							this.model,
							new Elem(n => n.elem('button', { className: buttonClassName, events: {
								click: () => this._fetchItems(this.model.props.offset < limit ? 0 : this.model.props.offset - limit),
							}}, [
								n.component(new FAIcon('angle-left')),
							])),
							(m, c) => c.setProperty('disabled', m.props.offset ? null : 'disabled'),
						)),
						n.component(new ModelComponent(
							this.model,
							new Elem(n => n.elem('button', { className: buttonClassName, events: {
								click: () => this._fetchItems(this.model.props.offset + limit),
							}}, [
								n.component(new FAIcon('angle-right')),
							])),
							(m, c) => c.setProperty('disabled', (m.props.count ?? 0) > limit ? null : 'disabled'),
						)),
					])),
					(col, _m) => this.model.set({ count: col ? col.length : null }),
				),
				(m, c, _change) => c.setCollection(m.props.items),
			)),
			n.component('list', new Transition()),
		]));
		this.elem.render(el);

		this._fetchItems(this.model.props.offset);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.model.set({ items: null });
		}
	}

	setTotal(total) {
		this.model.set({ total });
	}

	setPage(page) {
		if (typeof page != 'number' || page < 0) {
			page = 0;
		}
		this._fetchItems(page * (this.opt.limit || defaultLimit));
	}

	_fetchItems(offset) {
		const limit = this.opt.limit || defaultLimit;
		if (!this.elem || this.model.props.fetchingOffset === offset) return;

		if (this.model.props.items && this.model.props.offset === offset) {
			this.model.set({ fetchingOffset: null });
			return;
		}

		this.model.set({ fetchingOffset: offset });

		(this.opt.fetch
			? this.opt.fetch(offset, limit + 1)
			: this.opt.fetchCollection
				? this.opt.fetchCollection(offset, limit + 1).then(col => ({ items: col, total: undefined }))
				: Promise.resolve({ items: [], total: 0 })
		).then(result => {
			let { items, total } = result;
			if (!this.elem || offset !== this.model.props.fetchingOffset) return;

			const m = this.model;
			const dir = offset - m.props.offset;
			const cb = m.props.items
				? dir > 0
					? 'slideLeft'
					: dir < 0
						? 'slideRight'
						: 'fade'
				: 'fade';
			this.elem.getNode('list')[cb](new Elem(n => n.elem('div', [
				n.component(this.opt.listHeaderComponent
					? new ModelComponent(
						this.model,
						new Collapser(null),
						(m, c) => c.setComponent(m.props.items && m.props.count
							? this.opt.listHeaderComponent
							: null,
						),
					)
					: null,
				),
				n.component(new Context(
					() => new CollectionWrapper(items, { begin: 0, end: limit }),
					items => items.dispose(),
					items => new CollectionList(
						items,
						m => this.opt.componentFactory(m),
						{
							className: 'pagelist--list' + (this.opt.listClassName ? ' ' + this.opt.listClassName : ''),
							subClassName: this.opt.listSubClassName,
						},
					),
				)),
			])));

			if (total === undefined) {
				total = m.props.total;
			}

			m.set({ items, offset, fetchingOffset: null, total });
		});
	}

}
