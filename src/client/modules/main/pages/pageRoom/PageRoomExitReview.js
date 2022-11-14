import { ModelComponent } from 'modapp-resource-component';
import FormatTxt from 'components/FormatTxt';
import { Model } from 'modapp-resource';

class PageRoomExitReview {
	constructor(app, module, ctrl, room, exit) {
		this.app = app;
		this.module = module;
		this.ctrl = ctrl;
		this.room = room;
		this.exit = exit;
	}

	render(el) {
		const exitId = this.exit.id;
		const model = new Model({ data: { exit: null, error: null }, eventBus: this.app.eventBus });
		this.module.api.get('core.exit.' + exitId + '.details')
			.then(exit => {
				model.set({ exit });
			})
			.catch(error => {
				model.set({ error });
			});

		this.elem = new ModelComponent(
			model,
			new FormatTxt(`**${this.exit.name}**\n...`, {
				contentEditable: true,
			}),
			(m, c) => {
				if (m.exit) {
					c.setFormatText(`**${this.exit.name}**\n` + 
					`Alice ${m.exit?.leaveMsg}\n` +
					`Bob ${m.exit?.arriveMsg}\n` +
					`Eve ${m.exit?.travelMsg}\n`);
				} else {
					c.setFormatText(`**${this.exit.name}**`);
				}
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_useExit() {
		this.ctrl.call('useExit', { exitId: this.exit.id })
			.catch(err => this.module.toaster.openError(err));
	}

}

export default PageRoomExitReview;
