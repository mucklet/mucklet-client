import { Context } from 'modapp-base-component';
import { ModelComponent } from 'modapp-resource-component';
import { ModelWrapper } from 'modapp-resource';
import './mobileCharToggle.scss';

/**
 * MobileCharToggle adds an chat icon overlay to the activePanel main area that
 * is used to toggle open the mobile char panel.
 */
class MobileCharToggle {

	constructor(app, params) {
		this.app = app;

		this.app.require([
			'charLog',
			'avatar',
			'charPages',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.module.charLog.addOverlay({
			id: 'mobileCharToggle',
			componentFactory: (char, state, layoutId) => new Context(
				() => new ModelWrapper(char, { eventBus: this.app.eventBus }),
				model => model.dispose(),
				model => new ModelComponent(
					char,
					new ModelComponent(
						null,
						this.module.avatar.newAvatar(model, {
							size: 'medium',
							className: 'mobilechartoggle',
							events: {
								click: (c, ev) => {
									this.module.charPages.openPanel();
									ev.preventDefault();
								}
							}
						}),
						(m, c) => model.setModel(m
							? m.char || m.unseen
							: char
						)
					),
					(m, c) => c.setModel(m.lookingAt)
				)
			),
			filter: (char, layoutId) => layoutId == 'mobile'
		});
	}

	dispose() {
		this.module.charLog.removeOverlay('mobileCharToggle');
	}
}

export default MobileCharToggle;
