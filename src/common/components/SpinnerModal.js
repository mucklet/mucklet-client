import { RootElem } from 'modapp-base-component';
import './spinnerModal.scss';

/**
 * SpinnerModal draws a spinner modal.
 */
class SpinnerModal extends RootElem {
	constructor(opt) {
		opt = Object.assign({}, opt);
		opt.className = 'spinnermodal' + (opt.className ? ' ' + opt.className : '');

		super(n => n.elem('div', opt, [
			n.elem('div', { className: 'spinnermodal--cont' }, [
				n.elem('div', { className: 'spinnermodal--spinner' }),
			]),
		]));
	}
}

export default SpinnerModal;
