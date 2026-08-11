import { Elem } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import formatDateTime from 'utils/formatDateTime';


class RouteClientsClientBadge {
	constructor(module, model, client) {
		this.module = module;
		this.model = model;
		this.client = client;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('badge', 'div', {
			className: 'routeclients-clientbadge badge dark large btn',
			events: {
				click: (c, ev) => {
					this.module.self.setRoute({ clientId: this.model.client == this.client
						? null
						: this.client.id,
					});
					ev.stopPropagation();
				},
			},
		}, [
			n.elem('div', { className: 'badge--select' }, [
				n.elem('div', { className: 'badge--faicon' }, [
					n.component(new FAIcon('television')),
				]),
				n.elem('div', { className: 'badge--info-morepad' }, [
					n.elem('div', { className: 'routeclients-clientbadge--title badge--title badge--nowrap' }, [
						n.component(new ModelTxt(this.client, m => m.name)),
					]),
					n.elem('div', { className: 'routeclients-clientbadge--date badge--text badge--nowrap' }, [
						n.component(new ModelTxt(this.client, m => formatDateTime(new Date(m.created), { showYear: true }))),
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

export default RouteClientsClientBadge;
