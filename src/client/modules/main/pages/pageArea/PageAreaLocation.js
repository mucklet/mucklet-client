import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';


function getLocationType(location) {
	return location.type || (location.props.hasOwnProperty('area')
		? location.isInstance
			? 'instanceRoom'
			: 'room'
		: location.inInstance
			? 'instanceArea'
			: 'area'
	);
}

const locationTypeClass = {
	'area': 'badge--strong',
	'instanceRoom': 'badge--highlight',
};

class PageAreaLocation {
	constructor(module, location, inLocations, selectedModel, click) {
		this.module = module;
		this.location = location;
		this.inLocations = inLocations;
		this.selectedModel = selectedModel;
		this.click = click;
	}

	render(el) {
		let countComponent = new Txt('', {
			tagName: 'div',
			className: 'badge--text',
			duration: 0,
		});
		let nameComponent = new Txt('', { tagName: 'div' });
		let component = new Elem(n => n.elem('div', { className: 'pagearea-location' }, [
			n.elem('cont', 'div', { className: 'pagearea-location--cont' }, [
				n.elem('badge', 'div', {
					events: {
						click: () => this.click(this.location),
					},
				}, [
					n.elem('div', { className: 'badge--select' }, [
						n.elem('div', { className: 'badge--info' }, [
							n.component(nameComponent),
						]),
						n.elem('div', { className: 'badge--counter' }, [
							n.component(countComponent),
						]),
					]),
					n.component('content', new Collapser(null)),
				]),
			]),
		]));
		this.elem = new ModelComponent(
			this.selectedModel,
			new ModelComponent(
				this.location,
				new ModelComponent(
					this.inLocations,
					component,
					(m, c, change) => {
						component[this._inLocation() ? 'addNodeClass' : 'removeNodeClass']('cont', 'inlocation');
						this._updateCount(countComponent);
					},
				),
				(m, c) => {
					this._updateCount(countComponent);
					component.setNodeClassName('badge', 'badge btn' + (m.private ? ' pagearea-location--private' : ''));
					nameComponent.setText(m.name),
					nameComponent.setClassName((locationTypeClass[getLocationType(m)] || 'badge--text') + ' badge--nowrap');
				},
			),
			(m, c) => {
				let selected = this.location.id == m.selected;
				component[selected ? 'addClass' : 'removeClass']('selected');
				component.getNode('content').setComponent(selected && this.location.hasOwnProperty('shortDesc')
					? new ModelComponent(this.location, new Fader(null, { className: 'badge--select' }), (m, c) => c.setComponent(m.shortDesc
						? new Txt(m.shortDesc, { className: 'pagearea-location--content badge--margin badge--text badge--info' })
						: null,
					))
					: null,
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

	_updateCount(c) {
		c.setText(Math.max(this.location.pop, this.inLocations.props[this.location.id] || 0));
	}

	_inLocation() {
		return this.inLocations.props.hasOwnProperty(this.location.id);
	}

}

export default PageAreaLocation;
