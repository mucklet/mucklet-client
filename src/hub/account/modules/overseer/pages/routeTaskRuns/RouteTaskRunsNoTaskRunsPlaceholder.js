import { RootElem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';

/**
 * RouteTaskRunsNoTaskRunsPlaceholder draws a the placeholder on no routes.
 */
class RouteTaskRunsNoTaskRunsPlaceholder extends RootElem {
	constructor() {
		super(n => n.elem('div', { className: 'routetaskruns-notaskrunsplaceholder' }, [
			n.component(new Txt(l10n.l('routeTaskRuns.disclaimer1', "There are currently no taskruns. Create a new taskrun by clicking Create taskrun."), { tagName: 'p', className: 'common--placeholder' })),
		]));
	}
}

export default RouteTaskRunsNoTaskRunsPlaceholder;
