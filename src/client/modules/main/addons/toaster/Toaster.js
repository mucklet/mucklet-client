import { Txt } from 'modapp-base-component';
import { Collection } from 'modapp-resource';
import { CollectionList } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import './toaster.scss';
import ToasterToast from './ToasterToast';

const AUTOCLOSE_DURATION = 5000;

/**
 * Toaster shows toaster notifications.
 */
class Toaster {

	constructor(app, params) {
		this.app = app;

		this.app.require([ 'notify' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.collection = new Collection({
			eventBus: this.app.eventBus
		});
		this.autoclose = {};

		this.component = new CollectionList(this.collection, m => new ToasterToast(m, () => this.close(m.id)), {
			className: 'toaster',
			subClassName: () => 'toaster--item'
		});
		this.component.render(document.body);
	}

	/**
	 * Opens a new toaster notification.
	 * @param {object} [opt] Optional parameters
	 * @param {string} [opt.id] Id of the notification. Must be unique. Defaults to a random id.
	 * @param {string|function} [opt.title] Title text or title factory function.
	 * @param {string|Component|function} [opt.content] Content as formatted text, a component, or a component factory function.
	 * @param {function} [opt.onClose] Callback called on close.
	 * @param {string} [opt.closeOn] Type of closing. May be: 'click', 'button', or 'none'. Defaults to 'none'.
	 * @param {string} [opt.type] Type of notification. May be 'success', 'info', or 'error'. Defaults to 'info'.
	 * @param {bool|number} [opt.autoclose] Flag telling if notification should autoclose after a while. If the value is a number, it will autoclose after that many milliseconds.
	 * @param {Date} [opt.time] Time to show in mouse over tooltip.
	 * @return {function} Function to close the toaster.
	 */
	open(opt) {
		opt = Object.assign({
			content: null,
			title: null,
			onClose: null,
			time: new Date()
		}, opt);
		if (!opt.id) {
			while (true) {
				opt.id = (Math.random() + 1).toString(36).substring(7);
				if (!this.collection.get(opt.id)) {
					break;
				}
			}
		}

		let closer = this.close.bind(this, opt.id);
		if (this.collection.get(opt.id)) {
			// Prevent duplicate ids
			return closer;
		}

		this.collection.add(opt, this.collection.length);
		if (opt.title) {
			this.module.notify.send(opt.title);
		}

		if (opt.autoclose) {
			this.autoclose[opt.id] = setTimeout(closer, typeof opt.autoclose == 'number'
				? opt.autoclose
				: AUTOCLOSE_DURATION
			);
		}

		return closer;
	}

	/**
	 * Opens a toaster with an error message
	 * @param {String|LocaleString|object} msg Error message or error object.
	 * @param {object} [opt] Optional parameters.
	 * @param {object} [opt.title] Toaster title.
	 * @return {function} Function to close the toaster.
	 */
	openError(msg, opt) {
		opt = opt || {};
		if (msg) {
			console.error("[Toaster] Error: ", msg);
		}
		// Turn error into a LocaleString
		if (typeof msg === 'object' && msg !== null && msg.code && msg.message) {
			msg = l10n.l(msg.code, msg.message, msg.data);
		}
		return this.open({
			title: opt.title || l10n.l('toaster.errorOccurred', "An error occurred"),
			content: new Txt(msg || l10n.l('toaster.bodyPlaceholder', "An unexpected error was encountered. That's all I know."), { className: 'toaster--error' }),
			type: 'warn',
			closeOn: 'click',
			autoclose: true
		});
	}

	close(id) {
		let t = this.autoclose[id];
		if (t) {
			clearTimeout(t);
			delete this.autoclose[id];
		}
		let opt = this.collection.get(id);
		this.collection.remove(id);
		if (opt && opt.onClose) {
			opt.onClose();
		}
		return opt;
	}

	dispose() {
		this.component.unrender();
	}
}

export default Toaster;
