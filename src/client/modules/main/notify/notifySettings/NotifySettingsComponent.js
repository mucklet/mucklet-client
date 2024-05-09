import { Elem } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import Collapser from 'components/Collapser';
import LabelToggleBox from 'components/LabelToggleBox';
import l10n from 'modapp-l10n';

class NotifySettingsComponent {
	constructor(module) {
		this.module = module;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', [
			n.component(new ModelComponent(
				this.module.notify.getModel(),
				new LabelToggleBox(l10n.l('notify.enableNotifications', "Enable notifications"), false, {
					className: 'common--formmargin',
					onChange: (v, c) => this.module.notify.toggle(v).catch(err => {
						c.setValue(this.module.notify.getModel().enabled, false);
					}),
					popupTip: l10n.l('notify.enableNotificationsInfo', "Allow system notifications to show on certain events."),
					popupTipClassName: 'popuptip--width-s',
				}),
				(m, c) => c.setValue(m.enabled, false),
			)),
			n.component(new ModelComponent(
				this.module.notify.getModel(),
				new Collapser(),
				(model, c, change) => {
					if (change && !change.hasOwnProperty('enabled')) return;
					c.setComponent(model.enabled
						? new Elem(n => n.elem('div', { className: 'common--formsubsection' }, [
							n.component(new ModelComponent(
								model,
								new LabelToggleBox(l10n.l('notify.notifyOnWakeup', "Notify on any wakeup"), false, {
									className: 'common--formmargin small',
									onChange: (v, c) => model.set({ notifyOnWakeup: v }),
									popupTip: l10n.l('notify.notifyOnWakeupInfo', "Notify whenever any character wakes up."),
									popupTipClassName: 'popuptip--width-s',
								}),
								(m, c) => c.setValue(m.notifyOnWakeup, false),
							)),
							n.component(new ModelComponent(
								model,
								new LabelToggleBox(l10n.l('notify.notifyOnWatched', "Notify on watched"), false, {
									className: 'common--formmargin small',
									onChange: (v, c) => model.set({ notifyOnWatched: v }),
									popupTip: l10n.l('notify.notifyOnWatchedInfo', "Notify whenever a watched character wakes up."),
									popupTipClassName: 'popuptip--width-s',
								}),
								(m, c) => {
									c.setDisabled(m.notifyOnWakeup);
									c.setValue(m.notifyOnWakeup || m.notifyOnWatched, false);
								},
							)),
							n.component(new ModelComponent(
								model,
								new LabelToggleBox(l10n.l('notify.notifyOnMatched', "Notify on matched"), false, {
									className: 'common--formmargin small',
									onChange: (v, c) => model.set({ notifyOnMatched: v }),
									popupTip: l10n.l('notify.notifyOnMatchedInfo', "Notify whenever a character wakes up that matches current filter."),
									popupTipClassName: 'popuptip--width-s',
								}),
								(m, c) => {
									c.setDisabled(m.notifyOnWakeup);
									c.setValue(m.notifyOnWakeup || m.notifyOnMatched, false);
								},
							)),
							n.component(new ModelComponent(
								model,
								new LabelToggleBox(l10n.l('notify.notifyOnEvent', "Notify when targeted"), false, {
									className: 'common--formmargin small',
									onChange: (v, c) => model.set({ notifyOnEvent: v }),
									popupTip: l10n.l('notify.notifyOnEventInfo', "Notify on events targeting your character. Eg. whispers, summons, etc."),
									popupTipClassName: 'popuptip--width-s',
								}),
								(m, c) => c.setValue(m.notifyOnEvent, false),
							)),
							n.component(new ModelComponent(
								model,
								new LabelToggleBox(l10n.l('notify.notifyOnMention', "Notify when mentioned"), false, {
									className: 'common--formmargin small',
									onChange: (v, c) => model.set({ notifyOnMention: v }),
									popupTip: l10n.l('notify.notifyOnMentionInfo', "Notify whenever someone mentions the name of your character."),
									popupTipClassName: 'popuptip--width-s',
								}),
								(m, c) => c.setValue(m.notifyOnMention, false),
							)),
							n.component(new ModelComponent(
								model,
								new LabelToggleBox(l10n.l('notify.notifyOnRequests', "Notify on mail & requests"), false, {
									className: 'common--formmargin small',
									onChange: (v, c) => model.set({ notifyOnRequests: v }),
									popupTip: l10n.l('notify.notifyOnRequestsInfo', "Notify on new mail, requests, or other incoming events that may happen even if your character is asleep."),
									popupTipClassName: 'popuptip--width-s',
								}),
								(m, c) => c.setValue(m.notifyOnRequests, false),
							)),
						]))
						: null,
					);
				},
			)),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default NotifySettingsComponent;
