import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';


class PageAreaBadge {
	constructor(module, ctrl, area, opt) {
		this.module = module;
		this.ctrl = ctrl;
		this.area = area;
		this.opt = opt || {};
	}

	render(el) {
		this.elem = new ModelComponent(
			this.area,
			new Elem(n => n.elem('div', Object.assign({}, this.opt, { className: 'pagearea-badge' + (this.opt.className ? ' ' + this.opt.className : '') }), [
				n.elem('div', {
					className: 'badge btn',
					events: { click: () => this.module.self.open(this.ctrl) },
				}, [
					n.elem('div', { className: 'badge--select badge--select-margin flex-baseline' }, [
						n.elem('div', { className: 'badge--symbol' }, [
							n.component(new FAIcon('globe')),
						]),
						n.elem('div', { className: 'badge--info' }, [
							n.component('name', new Txt("", {
								tagName: 'div',
								className: 'badge--text',
							})),
						]),
						n.elem('div', { className: 'badge--counter' }, [
							n.component('pop', new Txt('', {
								tagName: 'div',
								className: 'badge--text',
								duration: 0,
							})),
						]),
					]),
				]),
			])),
			(m, c) => {
				c.getNode('name').setText(m.name);
				c.getNode('pop').setText((m.pop || "0") + (m.prv ? (' (+' + m.prv + ')') : ''));
				c.setAttribute(
					'title',
					l10n.t('pageArea.inPublic', "{count} in public", { count: m.pop || '0' }) +
					(m.prv
						? "\n" + l10n.t('pageArea.inPrivate', "{count} in private", { count: m.prv })
						: ''
					),
				);
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

export default PageAreaBadge;
