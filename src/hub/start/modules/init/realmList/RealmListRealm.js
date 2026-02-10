import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import Img from 'components/Img';
import renderingModes from 'utils/renderingModes';
import l10n from 'modapp-l10n';
import RealmTagsList from 'components/RealmTagsList';

function formatNumber(n) {
	let s = String(n);
	for (let i = s.length - 3; i > 0; i -= 3) {
		s = s.slice(0, i) + ' ' + s.slice(i);
	}
	return s;
}

function hasValidTag(tags) {
	let props = tags?.props || tags;
	if (props) {
		for (let k in props) {
			if (props[k].key) {
				return true;
			}
		}
	}
	return false;
}

/**
 * RealmListComponent draws the list of realms.
 */
class RealmListComponent {
	constructor(module, model, realm) {
		this.module = module;
		this.model = model;
		this.realm = realm;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new Elem(n => n.elem('div', {
				className: 'realmlist-realm',
			}, [
				n.elem('div', {
					className: 'realmlist-realm--cont',
					events: {
						click: (c, ev) => {
							// Toggle realmId
							this.model.set({ realmId: (this.model.realmId != this.realm?.id && this.realm?.id) || null });
							ev.stopPropagation();
						},
					},
				}, [

					// Image
					n.component(new ModelComponent(
						this.realm,
						new Img('', { className: 'realmlist-realm--img' }),
						(m, c, changed) => {
							c.setSrc(m?.image ? m.image.href + '?thumb=mw' : '/img/realm-placeholder.svg');
							c[m?.image ? 'removeClass' : 'addClass']('placeholder');
							for (let mode of renderingModes) {
								if (mode.className) {
									c[m?.image?.rendering == mode.key ? 'addClass' : 'removeClass'](mode.className);
								}
							}
						},
					)),

					// n.elem('img', { attributes: { src: '/img/realm1.png' }, className: 'realmlist-realm--img' }),
					n.elem('div', { className: 'realmlist-realm--header' }, [

						// Icon
						n.component(new ModelComponent(
							this.realm,
							new Img('', { className: 'realmlist-realm--icon' }),
							(m, c, changed) => {
								c.setSrc(m?.icon ? m.icon.href + '?thumb=m' : '/img/realmicon-placeholder.svg');
								c[m?.icon ? 'removeClass' : 'addClass']('placeholder');
								for (let mode of renderingModes) {
									if (mode.className) {
										c[m?.icon?.rendering == mode.key ? 'addClass' : 'removeClass'](mode.className);
									}
								}
							},
						)),

						n.elem('div', { className: 'realmlist-realm--title-cont' }, [

							// Title
							n.elem('span', { className: 'realmlist-realm--title' }, [
								n.component(new ModelTxt(this.realm, m => m?.name || '')),
							]),

							// Counters on mobile devices
							n.elem('div', { className: 'realmlist-realm--counters-top' }, [
								n.elem('div', { className: 'realmlist-realm--counter' }, [
									n.elem('span', { className: 'realmlist-realm--dot highlight' }),
									n.component(new ModelTxt(this.realm, m => l10n.l('realmList.countAwake', "{awake} Awake", { awake: formatNumber(m?.name.length + 2122331 || 0) }))),
								]),
								n.elem('div', { className: 'realmlist-realm--counter' }, [
									n.elem('span', { className: 'realmlist-realm--dot' }),
									n.component(new ModelTxt(this.realm, m => l10n.l('realmList.countCharacters', "{awake} Characters", { awake: formatNumber(m?.desc.length || 0) }))),
								]),
							]),
						]),
					]),

					// Tags
					// Only show tags if there is at least one valid tag.
					n.component(new ModelComponent(
						this.realm?.tags,
						new Collapser(),
						(m, c) => c.setComponent(hasValidTag(m)
							? new RealmTagsList(m, { className: 'realmlist-realm--tags', static: true })
							: null,
						),
					)),

					// Description
					n.elem('div', { className: 'realmlist-realm--desktop realmlist-realm--desc' }, [
						n.component(new ModelTxt(this.realm, m => m?.desc)),
					]),

					n.elem('div', { className: 'realmlist-realm--desktop realmlist-realm--footer' }, [

						// Counters on desktops
						n.elem('div', { className: 'realmlist-realm--counters' }, [
							n.elem('div', { className: 'realmlist-realm--counter' }, [
								n.elem('span', { className: 'realmlist-realm--dot highlight' }),
								n.component(new ModelTxt(this.realm, m => l10n.l('realmList.countAwake', "{awake} Awake", { awake: formatNumber(m?.name.length || 0) }))),
							]),
							n.elem('div', { className: 'realmlist-realm--counter' }, [
								n.elem('span', { className: 'realmlist-realm--dot' }),
								n.component(new ModelTxt(this.realm, m => l10n.l('realmList.countCharacters', "{awake} Characters", { awake: formatNumber(m?.desc.length || 0) }))),
							]),
						]),

						// Enter button
						n.elem('button', { className: 'realmlist-realm--signin btn primary' }, [
							n.component(new Txt('Enter')),
							n.elem('i', { className: 'fa fa-sign-in' }),
						]),
					]),
				]),

				// Mobile description
				n.component('mobile', new Collapser(null, { className: 'realmlist-realm--mobile' })),

				// // Caret on mobile devices
				// n.elem('div', { className: 'realmlist-realm--caret' }, [
				// 	n.elem('i', { className: 'fa fa-angle-down' }),
				// ]),
			])),
			(m, c) => {
				let isActive = this.model.realmId == this.realm?.id;
				c[isActive ? 'addClass' : 'removeClass']('active');
				let collapser = c.getNode('mobile');
				collapser.setComponent(isActive
					? collapser.getComponent() || new Elem(n => n.elem('div', { className: 'realmlist-realm--content' }, [
						n.elem('div', { className: 'realmlist-realm--desc' }, [
							n.component(new ModelTxt(this.realm, m => m?.desc)),
						]),

						n.elem('div', { className: 'realmlist-realm--footer' }, [
							// Enter button
							n.elem('button', { className: 'realmlist-realm--signin btn primary' }, [
								n.component(new Txt('Enter')),
								n.elem('i', { className: 'fa fa-sign-in' }),
							]),
						]),
					]))
					: null,
				);
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		this.elem?.unrender();
		this.elem = null;
	}
}

export default RealmListComponent;
