import { Elem } from 'modapp-base-component';

function randomWords(n, minCount, maxCount, minLength, maxLength) {
	return [ ...new Array(minCount + Math.floor(Math.random() * (1 + maxCount - minCount))) ].map(() => n.elem('span', {
		className: 'word',
		style: {
			width: (minLength + Math.random() * (1 + maxLength - minLength)) + 'em',
		},
	}));
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
		this.elem = new Elem(n => n.elem('div', {
			className: 'realmlist-placeholder',
		}, [
			n.elem('div', { className: 'realmlist-placeholder--cont' }, [

				// Image
				n.elem('div', { className: 'realmlist-placeholder--img' }),

				n.elem('div', { className: 'realmlist-placeholder--header' }, [

					// Icon
					n.elem('div', { className: 'realmlist-placeholder--icon' }),

					n.elem('div', { className: 'realmlist-placeholder--title-cont' }, [

						// Title
						n.elem('span', { className: 'realmlist-placeholder--title' }, randomWords(n, 2, 2, 4, 5)),

						// Counters on mobile devices
						n.elem('div', { className: 'realmlist-placeholder--counters-top' }, [
							n.elem('div', { className: 'realmlist-placeholder--counter' }, [
								n.elem('span', { className: 'realmlist-placeholder--dot highlight' }),
								n.elem('span', { className: 'realmlist-placeholder--count' }),
							]),
							n.elem('div', { className: 'realmlist-placeholder--counter' }, [
								n.elem('span', { className: 'realmlist-placeholder--dot' }),
								n.elem('span', { className: 'realmlist-placeholder--count' }),
							]),
						]),
					]),
				]),

				// Tags
				// Only show tags if there is at least one valid tag.
				n.elem('div', { className: 'realmlist-placeholder--tags' }, randomWords(n, 2, 3, 4, 6)),

				// Description
				n.elem('div', { className: 'realmlist-placeholder--desktop realmlist-placeholder--desc' }, randomWords(n, 8, 12, 1, 10)),

				n.elem('div', { className: 'realmlist-placeholder--desktop realmlist-placeholder--footer' }, [

					// Counters on desktops
					n.elem('div', { className: 'realmlist-placeholder--counters' }, [
						n.elem('div', { className: 'realmlist-placeholder--counter' }, [
							n.elem('span', { className: 'realmlist-placeholder--dot highlight' }),
							n.elem('span', { className: 'realmlist-placeholder--count' }),
						]),
						n.elem('div', { className: 'realmlist-placeholder--counter' }, [
							n.elem('span', { className: 'realmlist-placeholder--dot' }),
							n.elem('span', { className: 'realmlist-placeholder--count' }),
						]),
					]),
				]),
			]),
		]));
		return this.elem.render(el);
	}

	unrender() {
		this.elem?.unrender();
		this.elem = null;
	}
}

export default RealmListComponent;
