import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
// import Collapser from 'components/Collapser';
import Img from 'components/Img';
// import RealmTagsList from 'components/RealmTagsList';
// import SimpleBar from 'components/SimpleBar';
// import FormatTxt from 'components/FormatTxt';
import renderingModes from 'utils/renderingModes';

// function hasValidTag(tags) {
// 	let props = tags?.props || tags;
// 	if (props) {
// 		for (let k in props) {
// 			if (props[k].key) {
// 				return true;
// 			}
// 		}
// 	}
// 	return false;
// }

class GreetingScreenRealm {

	constructor(module, info, tags) {
		this.module = module;
		this.realm = info;
		this.tags = tags;
	}

	render(el) {
		// this.elem = <Elem class='greetingscreen'>
		// 	<div class='greetingscreen--card'>
		// 		<div nodeId="tjo" class='greetingscreen--realm'>
		// 			<ModelComponent
		// 				model={this.realm}
		// 				update={(m, c, changed) => {
		// 					c.setSrc(m?.image ? m.image.href + '?thumb=mw' : '/img/realm-placeholder.svg');
		// 					c[m?.image ? 'removeClass' : 'addClass']('placeholder');
		// 					for (let mode of renderingModes) {
		// 						if (mode.className) {
		// 							c[m?.image?.rendering == mode.key ? 'addClass' : 'removeClass'](mode.className);
		// 						}
		// 					}
		// 				}}
		// 			><Img class="greetingscreen--img"/></ModelComponent>
		// 		</div>
		// 	</div>
		// </Elem>;

		this.elem = new Elem(n => n.elem('div', { className: 'greetingscreen' }, [
			n.elem('div', { className: 'greetingscreen--card' }, [
				n.elem('div', { className: 'greetingscreen--realm' }, [

					// Image
					n.component(new ModelComponent(
						this.realm,
						new Img('', { className: 'greetingscreen--img' }),
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

					// n.elem('img', { attributes: { src: '/img/realm1.png' }, className: 'greetingscreen--img' }),
					n.elem('div', { className: 'greetingscreen--header' }, [

						// Icon
						n.component(new ModelComponent(
							this.realm,
							new Img('', { className: 'greetingscreen--icon' }),
							(m, c, changed) => {
								c.setSrc(m?.icon ? m.icon.href + '?thumb=m' : hubFileUrl + '/img/realmicon-placeholder.svg');
								c[m?.icon ? 'removeClass' : 'addClass']('placeholder');
								for (let mode of renderingModes) {
									if (mode.className) {
										c[m?.icon?.rendering == mode.key ? 'addClass' : 'removeClass'](mode.className);
									}
								}
							},
						)),

						n.elem('div', { className: 'greetingscreen--title-cont' }, [

							// Title
							n.elem('span', { className: 'greetingscreen--title' }, [
								n.component(new ModelTxt(this.realm, m => m?.name || '')),
							]),
						]),
					]),

					// // Tags
					// // Only show tags if there is at least one valid tag.
					// n.component(new ModelComponent(
					// 	this.realm?.tags,
					// 	new Collapser(),
					// 	(m, c) => c.setComponent(hasValidTag(m)
					// 		? new RealmTagsList(m, { className: 'greetingscreen--tags', static: true })
					// 		: null,
					// 	),
					// )),

					// // Description
					// n.elem('div', { className: 'greetingscreen--desktop greetingscreen--desc' }, [
					// 	n.component(new SimpleBar(
					// 		new ModelComponent(
					// 			this.realm,
					// 			new FormatTxt("", { className: 'common--desc-size', mode: 'default' }),
					// 			(m, c) => c.setFormatText(m.desc),
					// 		),
					// 		{
					// 			autoHide: false,
					// 			className: 'greetingscreen--descsb',
					// 		},
					// 	)),
					// ]),

					// n.elem('div', { className: 'greetingscreen--desktop greetingscreen--footer' }, [
					// ]),
				]),

				// // Mobile description
				// n.component('mobile', new Collapser(null, { className: 'greetingscreen--mobile' })),
			]),

		// 	// // Caret on mobile devices
		// 	// n.elem('div', { className: 'greetingscreen--caret' }, [
		// 	// 	n.elem('i', { className: 'fa fa-angle-down' }),
		// 	// ]),
		]));
		let rel = this.elem.render(el);
		return rel;
	}


	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default GreetingScreenRealm;
