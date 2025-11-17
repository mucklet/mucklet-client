import { Context, Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import FAIcon from 'components/FAIcon';
import PageHeader from 'components/PageHeader';
import DefinitionList from 'components/DefinitionList';
import VerticalStepProgress from 'components/VerticalStepProgress';
import l10n from 'modapp-l10n';
import formatDateTime from 'utils/formatDateTime';
import taskRunStates, { getTaskRunState } from 'utils/taskRunStates';
import formatDuration from 'utils/formatDuration';
import ModelCollapser from 'components/ModelCollapser';
import SimpleBar from 'components/SimpleBar';
import errToL10n from 'utils/errToL10n';

const txtError = l10n.l('routeTaskRuns.error', "Error");
const txtWarnings = l10n.l('routeTaskRuns.warnings', "Warnings");
const txtLog = l10n.l('routeTaskRuns.log', "Log");

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
	}

	render(el) {
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
								c.setIcon(st.oicon);
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

			// Steps
			n.component(new ModelComponent(
				this.taskRunSteps,
				new ModelComponent(
					this.taskRun,
					new VerticalStepProgress(null,
						(step) => {
							let s = this.taskRunSteps.props[step.idx];
							if (!s) {
								return step.idx < this.taskRun.currentStep;
							}
							if (step.idx > this.taskRun.currentStep) {
								return false;
							}
							return s.error
								? 'error'
								: s.warnings?.length
									? 'warning'
									: true;
						},
						(step) => new Elem(n => n.elem('div', { className: 'routetaskruns-taskrun--step' }, [
							n.component(new Txt(step.name, { className: 'routetaskruns-taskrun--stepname' })),
							n.component(new ModelCollapser(this.taskRunSteps, [{
								condition: (steps) => steps.props[step.idx],
								factory: (steps) => {
									let s = steps.props[step.idx];
									return new Elem(n => n.elem('div', { className: 'routetaskruns-taskrun--stepdetails' }, [
										// Duration
										n.component(new ModelTxt(s, m => formatDuration(m.duration, "0ms"), { className: 'routetaskruns-taskrun--stepduration' })),

										// Error
										n.component(new ModelCollapser(s, [{
											condition: m => m.error,
											factory: m => new Elem(n => n.elem('div', [
												n.component(new Txt(txtError, { className: 'routetaskruns-taskrun--stepsubtitle' })),
												n.elem('div', { className: 'routetaskruns-taskrun--steplog' }, [
													n.component(new SimpleBar(
														new ModelTxt(m, m => errToL10n(m.error), { className: 'routetaskruns-taskrun--steplogtxt' }),
														{
															className: 'routetaskruns-taskrun--stepsimplebar',
															autoHide: false,
														},
													)),
												]),
											])),
										}])),

										// Warnings
										n.component(new ModelCollapser(s, [{
											condition: m => m.warnings,
											factory: m => new Elem(n => n.elem('div', [
												n.component(new Txt(txtWarnings, { className: 'routetaskruns-taskrun--stepsubtitle' })),
												n.elem('div', { className: 'routetaskruns-taskrun--steplog' }, [
													n.component(new SimpleBar(
														new ModelTxt(m, m => m.warnings?.join("\n"), { className: 'routetaskruns-taskrun--steplogtxt' }),
														{
															className: 'routetaskruns-taskrun--stepsimplebar',
															autoHide: false,
														},
													)),
												]),
											])),
										}])),

										// Log
										n.component(new ModelCollapser(s, [{
											condition: m => !!m.log,
											factory: m => new Elem(n => n.elem('div', [
												n.component(new Txt(txtLog, { className: 'routetaskruns-taskrun--stepsubtitle' })),
												n.elem('div', { className: 'routetaskruns-taskrun--steplog' }, [
													n.component(new SimpleBar(
														new ModelTxt(m, m => m.log, { className: 'routetaskruns-taskrun--steplogtxt' }),
														{
															className: 'routetaskruns-taskrun--stepsimplebar',
															autoHide: false,
														},
													)),
												]),
											])),
										}])),
									]));
								},
							}])),
						])),
						{ className: 'routetaskruns-taskrun--steps' },
					),
					(m, c, change) => {
						if (!change || change.hasOwnProperty('stepNames')) {
							c.setCollection(m.stepNames.map((name, idx) => ({ name, idx })));
						}
						c.update();
					},
				),
				(m, c, change) => change && c.getComponent().update(),
			)),
		]));

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default RouteTaskRunsTaskRun;
