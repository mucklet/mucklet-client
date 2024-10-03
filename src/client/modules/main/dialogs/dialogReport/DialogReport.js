import { Context, Elem, Txt, Textarea } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import LabelToggleBox from 'components/LabelToggleBox';
import NoUiSlider from 'components/NoUiSlider';
import Dialog from 'classes/Dialog';
import formatTime from 'utils/formatTime';
import './dialogReport.scss';

function addMin(time, minDiff) {
	return new Date(time + 60 * 1000 * minDiff);
}

function toTime(ev, diff) {
	return ev && ev.time
		? formatTime(addMin(ev.time, diff))
		: '-';
}

class DialogReport {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'api',
			'charLog',
			'confirm',
			'toaster',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Open dialog to send a report.
	 * @param {string} ctrlId ID of controlled character sending the report.
	 * @param {string} charId ID of target character of the report.
	 * @param {string} puppeteerId ID of target puppeteer of the report.
	 * @param {object} [opt] Optional params
	 * @param {object} [opt.attachEvent] Event object attached to the report.
	 * @param {boolean} [opt.attachProfile] Flag to tell if the current charater profile should be attached.
	 */
	open(ctrlId, charId, puppeteerId, opt) {
		if (this.dialog) return;

		this.dialog = true;

		// let eventComponent = null;
		// if (ev) {
		// 	let f = this.module.charLog.getEventComponentFactory(ev.type);
		// 	eventComponent = (f && f(charId, ev, { noCode: true, noButton: true })) || null;
		// }

		this.module.api.get('core.char.' + charId)
			.then(char => {
				let model = new Model({ data: {
					msg: "",
					attachLog: !!opt?.attachEvent,
					attachProfile: !!opt?.attachProfile,
					start: -20,
					end: 10,
					snapshotPromise: null,
				}, eventBus: this.app.eventBus });

				this._setCharSnapshot(model, charId);

				let logAttachComponent = null;
				if (opt?.attachEvent) {
					logAttachComponent = new Elem(n => n.elem('div', [
						n.component(new LabelToggleBox(l10n.l('dialogReport.attachLog', "Attach log to report"), model.attachLog, {
							className: 'common--sectionpadding',
							onChange: (v, c) => {
								model.set({ attachLog: v });
							},
							popupTip: l10n.l('dialogReport.attachLogInfo', "Attaches a section of your character's log to the report.\nIt will only be seen by moderators."),
							popupTipClassName: 'popuptip--width-m',
						})),
						n.component(new ModelComponent(
							model,
							new Collapser(),
							(m, c, change) => {
								if (change && !change.hasOwnProperty('attachLog')) return;
								c.setComponent(model.attachLog
									? new PanelSection(
										l10n.l('dialogReport.logInterval', "Log interval"),
										new Elem(n => n.elem('div', { className: 'pad-bottom-l' }, [
											n.elem('div', [
												n.component(new ModelTxt(
													model,
													m => toTime(opt?.attachEvent, m.start),
													{ duration: 0 },
												)),
												n.text(" – "),
												n.component(new Context(
													() => ({ timer: null }),
													o => clearTimeout(o.timer),
													o => new ModelComponent(
														model,
														new Txt('', { duration: 0 }),
														(m, c, change) => {
															if (change && !change.hasOwnProperty('end')) return;

															clearTimeout(o.timer);
															let endTime = addMin(opt?.attachEvent.time, m.end);
															let diff = endTime - (new Date().getTime());
															c.setText(diff > 0
																? l10n.l('dialogReport.now', "now")
																: formatTime(endTime),
															);
															if (diff > 0) {
																o.timer = setTimeout(() => {
																	c.setText(formatTime(endTime));
																}, diff);
															}
														},
													),
												)),
											]),
											n.component(new NoUiSlider({
												start: [ model.start, model.end ],
												step: 5,
												range: { min: [ -60 ], '50%': [ 0, 5 ], max: [ 60 ] },
												connect: [ false, true, false ],
												pips: {
													mode: 'steps',
													density: 60,
													filter: v => v == 0 ? 0 : -1,
													format: {
														to: v => toTime(opt?.attachEvent, v),
														from: v => v,
													},
												},
												className: 'dialogreport--slider pips-centered',
												onUpdate: (c, v, handle, unencoded, tap, positions, slider) => {
													let start = parseInt(v[0]);
													let end = parseInt(v[1]);
													if (start > 0) {
														start = 0;
														slider.setHandle(0, 0, false);
													}
													if (end < 0) {
														end = 0;
														slider.setHandle(1, 0, false);
													}
													model.set({ start, end });
												},
											})),
										])),
										{
											className: 'common--sectionpadding small',
											noToggle: true,
											popupTip: l10n.l('dialogReport.logIntevalInfo', "Time interval of log events to include in the attachment."),
										},
									)
									: null,
								);
							},
						)),
					]));
				}

				this.dialog = new Dialog({
					title: l10n.l('dialogReport.reportCharacter', "Report character"),
					className: 'dialogreport',
					content: new Elem(n => n.elem('div', [
						n.component(new ModelTxt(char, m => (m.name + " " + m.surname).trim(), { className: 'dialogreport--fullname flex-1' })),
						// n.component(eventComponent),
						n.component('msg', new PanelSection(
							l10n.l('dialogReport.message', "Report message"),
							new Textarea(model.msg, {
								className: 'dialogreport--msg dialog--input common--paneltextarea-small common--desc-size',
								events: {
									input: c => {
										let v = c.getValue().replace(/\r?\n/gi, '');
										c.setValue(v);
										model.set({ msg: v });
									},
								},
								attributes: { name: 'dialogreport-msg', spellcheck: 'true' },
							}),
							{
								className: 'common--sectionpadding',
								noToggle: true,
								popupTip: l10n.l('dialogReport.messageInfo', "Describe what you wish to report. This will only be seen by moderators."),
							},
						)),
						n.component(logAttachComponent),
						n.component(new LabelToggleBox(l10n.l('dialogReport.attachProfile', "Attach character profile to report"), model.attachProfile, {
							className: 'common--sectionpadding',
							onChange: (v, c) => {
								model.set({ attachProfile: v });
								this._setCharSnapshot(model, charId);
							},
							popupTip: l10n.l('dialogReport.attachProfileInfo', "Attaches the character's current profile to the report. This includes information such as image, name, gender, species, description, about, and tags."),
							popupTipClassName: 'popuptip--width-m',
						})),
						n.component('message', new Collapser(null)),
						n.elem('div', { className: 'pad-top-xl' }, [
							n.elem('submit', 'button', {
								events: { click: () => this._sendReport(ctrlId, charId, puppeteerId, opt?.attachEvent, model) },
								className: 'btn primary dialog-btn dialogreport--submit',
							}, [
								n.component(new Txt(l10n.l('dialogReport.sendReport', "Send report"))),
							]),
						]),
					])),
					onClose: () => { this.dialog = null; },
				});

				this.dialog.open();
				this.dialog.getContent().getNode('msg').getComponent().getElement().focus();
			})
			.catch(err => {
				this.dialog = null;
				this.module.confirm.openError(err);
			});
	}

	_sendReport(ctrlId, charId, puppeteerId, ev, model) {
		if (this.reportPromise) return this.reportPromise;

		let ctrl = this.module.player.getControlledChar(ctrlId);
		if (!ctrl) {
			this._setMessage(l10n.l('dialogReport.charNotControlled', "Must control the character making the report."));
			return;
		}

		let attachments = [];

		// Attach logs if needed
		this.reportPromise = (model.attachLog
			? this._getLog(ctrl, addMin(ev.time, model.start).getTime(), addMin(ev.time, model.end).getTime()).then(events => {
				attachments.push({
					type: 'log',
					params: { events },
				});
			})
			: Promise.resolve()
		).then(() => {
			// Attach charSnapshot if needed
			return (model.attachProfile
				? model.snapshotPromise.then(snapshotId => {
					attachments.push({
						type: 'charSnapshot',
						params: { snapshotId },
					});
				})
				: Promise.resolve()
			).then(() => {
				// Create report
				return this.module.api.call('report.reports', 'create', {
					charId: ctrlId,
					targetId: charId,
					puppeteer: puppeteerId || undefined,
					msg: model.msg,
					attachments: attachments.length ? attachments : undefined,
				}).then(() => {
					if (this.dialog) {
						this.dialog.close();
					}
					this.module.toaster.open({
						title: l10n.l('dialogReport.reportSent', "Report sent"),
						content: new Txt(l10n.l('dialogReport.reportSentBody', "The report was successfully sent to the moderators.")),
						closeOn: 'click',
						type: 'success',
						autoclose: true,
					});
				}).catch(err => {
					if (!this.dialog) return;
					this._setMessage(l10n.l(err.code, err.message, err.data));
				}).then(() => {
					this.reportPromise = null;
				});
			});
		});

		return this.reportPromise;
	}

	_setMessage(msg) {
		if (!this.dialog) return;
		let n = this.dialog.getContent().getNode('message');
		n.setComponent(msg ? new Txt(msg, { className: 'dialog--error' }) : null);
	}

	_getLog(char, startTime, endTime, chunk, log) {
		chunk = chunk || 0;
		log = log || [];
		return this.module.charLog.getLog(char, chunk).then(l => {
			if (!l || !l.length) return log;

			if (!Array.isArray(l)) l = l.toArray();

			let end = l.length;
			for (let i = end - 1; i >= 0; i--) {
				let ev = l[i];
				if (ev.time) {
					if (ev.time > endTime) {
						end = i;
					}
					if (ev.time < startTime) {
						return l.slice(i + 1, end).filter(ev => !ev.noReport).concat(log);
					}
				}
			}

			return this._getLog(char, startTime, endTime, chunk + 1, end ? l.slice(0, end).filter(ev => ev.sig).concat(log) : log);
		});
	}

	/**
	 * Checks if a charSnapshot needs to be created, and if so creates it.
	 * Subsequent calls to this function will not create a new snapshot.
	 * @param {Model} model Dialog model.
	 * @param {string} charId Character ID.
	 */
	_setCharSnapshot(model, charId) {
		if (model.snapshotPromise || !model.attachProfile) {
			return;
		}
		model.set({ snapshotPromise: this.module.api.call('report.charsnapshots', 'create', { charId })
			.catch(err => {
				this._setMessage(l10n.l(err.code, err.message, err.data));
				model.set({
					attachProfile: false,
					snapshotPromise: null,
				});
			}),
		});
	}
}

export default DialogReport;
