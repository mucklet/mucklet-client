import { Elem } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import formatDateTime from 'utils/formatDateTime';


class RouteReleasesReleaseBadge {
	constructor(module, model, release, type) {
		this.module = module;
		this.model = model;
		this.release = release;
		this.type = type;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', {
			className: 'routereleases-releasebadge badge dark btn',
			events: {
				click: (c, ev) => {
					this.module.self.setRoute(this.type.key, { releaseId: this.release.id });
					ev.stopPropagation();
				},
			},
		}, [
			n.elem('div', { className: 'badge--select' }, [
				n.elem('div', { className: 'badge--faicon' }, [
					n.component(new FAIcon(this.type.icon)),
				]),
				n.elem('div', { className: 'badge--info-morepad' }, [
					n.elem('div', { className: 'routereleases-releasebadge--title badge--title badge--nowrap' }, [
						n.component(new ModelTxt(this.release, m => m.name)),
					]),
					n.elem('div', { className: 'routereleases-releasebadge--date badge--text badge--nowrap' }, [
						n.component(new ModelTxt(this.release, m => formatDateTime(new Date(m.created), { showYear: true }))),
					]),
				]),
			]),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default RouteReleasesReleaseBadge;
