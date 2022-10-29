import { Elem, Txt } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import formatDateTime from 'utils/formatDateTime';

class ControlEventComponent extends Elem {
	constructor(module, charId, ev, opt) {
		opt = opt || {};
		let c = ev.hchar;
		super(n => n.elem('div', { className: 'ev-control--border' + (opt.noButton ? '' : ' flex-row') }, [
			n.component(new Txt(c && (c.name + " " + c.surname).trim() + " – " + formatDateTime(new Date(ev.time)), {
				className: opt.noButton ? null : 'flex-1'
			})),
			n.component(opt.noButton ? null : new Elem(n => n.elem('button', {
				className: 'iconbtn tiny tinyicon',
				events: {
					click: (c, e) => {
						module.dialogExportLog.open(module.player.getControlledChar(charId), ev.time);
						e.stopPropagation();
					}
				}
			}, [
				n.component(new FAIcon('file-text-o'))
			])))
		]));
	}

	get noMenu() {
		return true;
	}
}

export default ControlEventComponent;
