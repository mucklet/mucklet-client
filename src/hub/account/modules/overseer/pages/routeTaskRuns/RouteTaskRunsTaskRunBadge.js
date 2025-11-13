import { Elem } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import Fader from 'components/Fader';
import formatDateTime from 'utils/formatDateTime';
import formatDuration from 'utils/formatDuration';
import taskRunStates, { getTaskRunState } from 'utils/taskRunStates';

class RouteTaskRunsTaskRunBadge {
	constructor(module, type, model, taskRun) {
		this.module = module;
		this.type = type;
		this.model = model;
		this.taskRun = taskRun;
	}

	render(el) {
		const iconFader = new Fader(null, { className: 'routetaskruns-taskrunbadge--icon badge--faicon bg' });
		const faIcon = new FAIcon();
		this.elem = new ModelComponent(
			this.taskRun,
			new Elem(n => n.elem('div', {
				className: 'routetaskruns-taskrunbadge badge dark btn',
				events: {
					click: (c, ev) => {
						this.module.self.setRoute(this.type.key, { taskRunId: this.taskRun.id, pageNr: this.model.pageNr });
						ev.stopPropagation();
					},
				},
			}, [
				n.elem('div', { className: 'badge--select' }, [
					n.component(iconFader),
					n.elem('div', { className: 'badge--info-morepad flex-1' }, [
						n.elem('div', { className: 'routetaskruns-taskrunbadge--title badge--strong badge--nowrap' }, [
							n.component(new ModelTxt(this.taskRun, m => m.taskName)),
						]),
						n.elem('div', { className: 'routetaskruns-taskrunbadge--date badge--text badge--nowrap' }, [
							n.component(new ModelTxt(this.taskRun, m => m.done
								? formatDuration(m.done - m.started)
								: m.stepNames[m.currentStep],
							)),
						]),
					]),
					n.elem('div', { className: 'badge--padright badge--text badge--nowrap flex-auto' }, [
						n.component(new ModelTxt(this.taskRun, m => formatDateTime(new Date(m.started), { showYear: true }))),
					]),
				]),
			])),
			(m, c) => {
				let state = m.state;
				let st = getTaskRunState(m.state);
				if (state == 'running') {
					let prev = iconFader.getComponent();
					iconFader.setComponent(!prev || prev == faIcon
						? new Elem(n => n.elem('div', { className: 'spinner small' }))
						: prev,
					);
				} else {
					faIcon.setIcon(st?.icon || 'cogs');
					iconFader.setComponent(faIcon);
				}
				for (let s of taskRunStates) {
					iconFader[st == s ? 'addClass' : 'removeClass'](s.className);
				}
			},
		);
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default RouteTaskRunsTaskRunBadge;
