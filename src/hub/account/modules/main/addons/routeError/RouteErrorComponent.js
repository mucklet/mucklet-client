import { Elem, Txt } from 'modapp-base-component';
import PageHeader from 'components/PageHeader';
import errToL10n from 'utils/errToL10n';

/**
 * RouteNodesError draws a node error
 */
class RouteNodesError extends Elem {
	constructor(title, error, opt) {
		super(n => n.elem('div', { className: 'routeerror' }, [
			n.component(new PageHeader(title), "", { className: 'flex-1' }),
			n.elem('div', { className: 'common--hr' }),
			...(opt?.body
				? [ n.component(new Txt(opt.body, { tagName: 'p', className: 'common--placeholder' })) ]
				: []
			),
			n.component(new Txt(errToL10n(error), { tagName: 'p', className: 'common--placeholder' })),
		]));
	}
}

export default RouteNodesError;
