import { RootElem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

/**
 * RouteReleasesNoReleasesPlaceholder draws a the placeholder on no routes.
 */
class RouteReleasesNoReleasesPlaceholder extends RootElem {
	constructor() {
		super(n => n.elem('div', { className: 'routereleases-noreleasesplaceholder' }, [
			n.component(new Txt(l10n.l('routeReleases.disclaimer1', "There are currently no releases. Create a new release by clicking Create release."), { tagName: 'p', className: 'common--placeholder' })),
		]));
	}
}

export default RouteReleasesNoReleasesPlaceholder;
