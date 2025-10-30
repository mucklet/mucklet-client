import { Elem, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PageHeader from 'components/PageHeader';
import FAIcon from 'components/FAIcon';
import RouteReleasesReleaseBadge from './RouteReleasesReleaseBadge';
import RouteReleasesNoReleasesPlaceholder from './RouteReleasesNoReleasesPlaceholder';
import types from './routeReleasesTypes';

/**
 * RouteReleasesReleases draws a list of release badge components.
 */
class RouteReleasesReleases {
	constructor(module, model, releases, user) {
		this.module = module;
		this.model = model;
		this.type = types[model.type];
		this.releases = releases;
		this.user = user;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'routereleases-releases' }, [
			n.elem('div', { className: 'flex-row flex-end' }, [
				n.component(new PageHeader(this.type.name, "", { className: 'flex-1' })),
				n.elem('div', { className: 'flex-col' }, [
					n.elem('button', {
						className: 'btn fa small',
						events: {
							click: (c, ev) => {
								ev.stopPropagation();
								this.module.dialogCreateRelease.open(this.type.key, {
									onCreate: release => this.module.self.setRoute(this.type.key, { releaseId: release.id }),
								});
							},
						},
					}, [
						n.component(new FAIcon('plus')),
						n.component(new Txt(l10n.l('routeReleases.createRelease', "Create release"))),
					]),
				]),
			]),
			n.elem('div', { className: 'common--hr' }),
			n.component(new CollectionList(
				this.releases,
				m => new RouteReleasesReleaseBadge(this.module, this.model, m, this.type),
				{
					className: 'routepayments-payments--list',
					subClassName: () => 'routepayments-payments--listitem',
				},
			)),
			n.component(new CollectionComponent(
				this.releases,
				new Collapser(),
				(col, c) => c.setComponent(col?.length ? null : new RouteReleasesNoReleasesPlaceholder()),
			)),
		]));

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default RouteReleasesReleases;
