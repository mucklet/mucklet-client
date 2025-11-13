import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import FAIcon from 'components/FAIcon';
import PageHeader from 'components/PageHeader';
import Collapser from 'components/Collapser';
import l10n from 'modapp-l10n';
import PageList from 'components/PageList';
import RouteTaskRunsTaskRunBadge from './RouteTaskRunsTaskRunBadge';

const taskRunsPerPage = 20;

/**
 * RouteTaskRunsProject draws the taskRuns list for a project.
 */
class RouteTaskRunsProject {
	constructor(module, type, model, project) {
		this.module = module;
		this.type = type;
		this.model = model;
		this.project = project;
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Elem(n => n.elem('div', { className: 'routetaskruns-project' }, [
			n.elem('div', { className: 'flex-row flex-end' }, [
				n.component(new PageHeader(this.type.txtTaskRuns, "", { className: 'flex-1' })),
				n.elem('div', { className: 'flex-col' }, [
					n.elem('button', {
						className: 'btn fa small',
						events: {
							click: (c, ev) => {
								ev.stopPropagation();
								this.type.setParentRoute(this.module, this.project);
							},
						},
					}, [
						n.component(new FAIcon('angle-left')),
						n.component(new Txt(this.type.txtBackToProjects)),
					]),
				]),
			]),
			n.elem('div', { className: 'common--hr' }),

			// Sub header
			n.elem('div', { className: 'flex-row' }, [
				// Project name
				n.elem('div', { className: 'flex-1' }, [
					n.component(new ModelTxt(this.project, m => m.name, { className: 'routetaskruns-project--name' })),
				]),
			]),

			// TaskRuns
			n.component(new ModelComponent(
				this.model,
				new PageList({
					fetchCollection: (offset, limit) => {
						// Update URL with new page nr.
						this.module.self.setRoute(this.type.key, {
							projectKey: this.project.id,
							pageNr: Math.floor(offset / taskRunsPerPage),
						});
						return this.type.fetchTaskRuns(this.module, this.project, offset, limit);
					},
					componentFactory: (taskRun) => new RouteTaskRunsTaskRunBadge(this.module, this.type, this.model, taskRun),
					itemName: l10n.l('routeTaskRuns.taskRun', "Task run"),
					placeholder: this.type.txtNoTaskRunsPlaceholder,
					page: this.model.pageNr,
					limit: taskRunsPerPage,
					className: 'routetaskruns-project--pagelist',
					listSubClassName: () => 'routetaskruns-project--pagelistitem',
				}),
				(m, c) => {
					if (m.project == this.project) {
						c.setPage(m.pageNr || 0);
					}
				},
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

export default RouteTaskRunsProject;
