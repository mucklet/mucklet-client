import ModelFader from 'components/ModelFader';
import l10n from 'modapp-l10n';
import RouteTaskRunsProject from './RouteTaskRunsProject';
import RouteTaskRunsTaskRun from './RouteTaskRunsTaskRun';

/**
 * RouteTaskRunsComponent draws a the taskRun route page.
 */
class RouteTaskRunsComponent {
	constructor(module, type, model) {
		this.module = module;
		this.type = type;
		this.model = model;
	}

	render(el) {
		this.elem = new ModelFader(this.model, [
			{
				condition: m => m.taskRun,
				factory: m => new RouteTaskRunsTaskRun(this.module, this.type, m, m.project, m.taskRun, m.taskRunSteps),
				hash: m => m.taskRun,
			},
			{
				condition: m => m.project,
				factory: m => new RouteTaskRunsProject(this.module, this.type, m, m.project),
				hash: m => m.project,
			},
			{
				condition: m => m.error,
				factory: m => this.module.routeError.newError(l10n.l('routeTaskRuns.errorLoadingTaskRun', "Error loading taskrun"), m.error),
				hash: m => m.error,
			},
		]);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}
}

export default RouteTaskRunsComponent;
