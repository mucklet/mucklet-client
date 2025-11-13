import { Context, Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import FAIcon from 'components/FAIcon';
import PageHeader from 'components/PageHeader';
import Collapser from 'components/Collapser';
import DefinitionList from 'components/DefinitionList';
import l10n from 'modapp-l10n';
import formatDateTime from 'utils/formatDateTime';
import taskRunStates, { getTaskRunState } from 'utils/taskRunStates';
import formatDuration from 'utils/formatDuration';

/**
 * RouteTaskRunsTaskRun draws details for a taskRun.
 */
class RouteTaskRunsTaskRun {
	constructor(module, type, model, project, taskRun, taskRunSteps) {
		this.module = module;
		this.type = type;
		this.model = model;
		this.project = project;
		this.taskRun = taskRun;
		this.taskRunSteps = taskRunSteps;
		console.log("PROJECT: ", this.project);
		console.log("TASKRUN: ", this.taskRun);
		console.log("STEPS: ", this.taskRunSteps);
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Elem(n => n.elem('div', { className: 'routetaskruns-taskrun' }, [
			n.elem('div', { className: 'flex-row flex-end' }, [
				n.component(new PageHeader(this.type.txtTaskRun, "", { className: 'flex-1' })),
				n.elem('div', { className: 'flex-col' }, [
					n.elem('button', {
						className: 'btn fa small',
						events: {
							click: (c, ev) => {
								ev.stopPropagation();
								this.module.self.setRoute(this.type.key, {
									projectKey: this.type.getProjectKey(this.project),
									pageNr: this.model.pageNr,
								});
							},
						},
					}, [
						n.component(new FAIcon('angle-left')),
						n.component(new Txt(l10n.l('routeTaskRuns.backToTaskRuns', "Back to task runs"))),
					]),
				]),
			]),
			n.elem('div', { className: 'common--hr' }),

			// Sub header
			n.elem('div', { className: 'flex-row' }, [
				// Project name
				n.elem('div', { className: 'flex-1' }, [
					n.component(new ModelTxt(this.project, m => m.name, { className: 'routetaskruns-taskrun--name' })),
				]),
			]),

			// Sections
			n.component(new Context(
				() => new CollectionWrapper([
					// State
					{
						title: l10n.l('routeTaskRuns.state', "State"),
						icon: new ModelComponent(
							this.taskRun,
							new FAIcon(),
							(m, c) => {
								let st = getTaskRunState(m.state);
								c.setIcon(st.icon);
								for (let s of taskRunStates) {
									c[st == s ? 'addClass' : 'removeClass'](s.className);
								}
							},
						),
						component: new ModelTxt(this.taskRun, m => (m.state == 'running' && m.stepNames[m.currentStep]) || getTaskRunState(m.state).text),
					},
					// Task name
					{
						title: l10n.l('routeTaskRuns.task', "Task"),
						icon: 'cogs',
						component: new ModelTxt(this.taskRun, m => m.taskName),
					},
					// Started timestamp
					{
						title: l10n.l('routeTaskRuns.started', "Started"),
						icon: 'calendar',
						component: new ModelTxt(this.taskRun, m => formatDateTime(new Date(m.started), { showYear: true })),
					},
					// Running duration
					{
						title: l10n.l('routeTaskRuns.duration', "Duration"),
						icon: 'clock-o',
						filter: m => !!m.done,
						component: new ModelTxt(this.taskRun, m => formatDuration(m.done - m.started)),
					},
				], {
					filter: m => m.filter ? m.filter(this.taskRun) : true,
				}),
				(items) => items.dispose(),
				(items) => new ModelComponent(
					this.taskRun,
					new DefinitionList(items, { className: 'routetaskruns-taskrun--info' }),
					(m, c) => items.refresh(),
				),
			)),
		]));

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.messageComponent = null;
		}
	}
}

export default RouteTaskRunsTaskRun;
