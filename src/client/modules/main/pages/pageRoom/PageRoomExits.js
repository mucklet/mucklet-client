import { Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Fader from 'components/Fader';
import resourceComponentSelector from 'utils/resourceComponentSelector';
import PageRoomExit from './PageRoomExit';

class PageRoomExits extends CollectionComponent {
	constructor(module, ctrl, exits, opt = {}) {

		let onClick = opt?.onExitClick || ((exitId, ev) => {
			ctrl.call('useExit', { exitId })
				.catch(err => module.toaster.openError(err));
		});

		super(
			exits,
			new Fader(null, opt),
			resourceComponentSelector([
				{
					condition: col => !col || !col.length,
					factory: col => new Txt(l10n.l('pageRoom.noExits', "There are no exits."), { className: 'common--nolistplaceholder' }),
				},
				{
					factory: col => new CollectionList(
						col,
						m => new PageRoomExit(module, ctrl, m, onClick, opt),
					),
				},
			]),
		);
	}
}

export default PageRoomExits;
