import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import formatByteSize from 'utils/formatByteSize';

class RouteReleasesTemplateBadge {
	constructor(module, release, key) {
		this.module = module;
		this.release = release;
		this.templates = release.templates;
		this.key = key;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', {
			className: 'routereleases-templatebadge badge dark btn',
			events: {
				click: (c, ev) => {
					this.module.dialogEditReleaseTemplate.open(this.release.id, this.key);
					ev.stopPropagation();
				},
			},
		}, [
			n.elem('div', { className: 'badge--info flex-row flex-start flex-center' }, [
				n.elem('div', { className: 'routereleases-templatebadge--state badge--nowrap flex-1' }, [
					n.component(new Txt(this.key, { className: 'badge--strong' })),
				]),
				n.elem('div', { className: 'routereleases-templatebadge--size badge--text badge--nowrap flex-auto' }, [
					n.component(new ModelTxt(this.templates, m => formatByteSize(this.templates[this.key].length))),
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

export default RouteReleasesTemplateBadge;
