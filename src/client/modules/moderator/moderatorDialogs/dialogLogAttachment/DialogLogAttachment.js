import { Elem } from 'modapp-base-component';
import { ModelTxt, CollectionList } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import SimpleBar from 'components/SimpleBar';
import Dialog from 'classes/Dialog';
import formatTimeSpan from 'utils/formatTimeSpan';
import errString from 'utils/errString';
import './dialogLogAttachment.scss';

const txtUnknown = l10n.l('dialogLogAttachment.unknown', "(Unknown)");

class DialogLogAttachment {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'api', 'charLog', 'confirm', 'avatar' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Open dialog to show a log attachment
	 * @param {Model} reporter Reporter object.
	 */
	open(reporter) {
		if (this.dialog) return;

		this.dialog = true;

		this.module.api.get('report.reporter.' + reporter.id + '.log')
			.then(log => {
				this.dialog = new Dialog({
					title: l10n.l('dialogLogAttachment.logAttachment', "Log attachment"),
					className: 'dialoglogattachment',
					content: new Elem(n => n.elem('div', [
						n.elem('div', { className: 'flex-row pad12 pad-bottom-l' }, [
							n.elem('div', { className: 'flex-auto' }, [
								n.component(this.module.avatar.newAvatar(log.char, { size: 'large' }))
							]),
							n.elem('div', { className: 'flex-1' }, [
								n.component(new ModelTxt(log.char, m => errString(m, m => (m.name + ' ' + m.surname).trim(), txtUnknown), { tagName: 'div', className: 'dialoglogattachment--fullname' })),
								n.component(log.puppeteer
									? new ModelTxt(log.puppeteer, m => errString(m, m => '(' + (m.name + ' ' + m.surname).trim() + ')', txtUnknown), { tagName: 'div', className: 'dialoglogattachment--puppeteer' })
									: null
								),
								n.elem('div', { className: 'dialoglogattachment--interval flex-1' }, [
									n.component(new ModelTxt(log, m => formatTimeSpan(new Date(m.startTime), new Date(m.endTime)))),
								])
							]),
						]),
						n.elem('div', { className: 'dialoglogattachment--eventscont' }, [
							n.component(new SimpleBar(
								new CollectionList(log.events, ev => {
									return this.module.charLog.getLogEventComponent(log.char.id, ev, { noCode: true, noButton: true, noMenu: true });
								}, {
									className: 'dialoglogattachment--eventlist'
								}),
								{
									className: 'dialoglogattachment--events',
									autoHide: false
								}
							)),
						])
					])),
					onClose: () => this.dialog = null,
				});

				this.dialog.open();
			})
			.catch(err => {
				this.dialog = null;
				this.module.confirm.openError(err);
			});
	}
}

export default DialogLogAttachment;
