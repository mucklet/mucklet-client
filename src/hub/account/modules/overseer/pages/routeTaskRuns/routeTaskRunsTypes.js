import { Elem } from 'modapp-base-component';
import FAIcon from 'components/FAIcon';
import l10n from 'modapp-l10n';

const types = {
	'realm': {
		id: 'realmtaskruns',
		key: 'realm',
		parentId: 'realms',
		name: l10n.l('routeTaskRuns.realmTaskRuns', "Realm task runs"),
		icon: 'cogs',
		order: 1120,
		fetchProject: (module, projectKey) => module.api.get(`control.realm.${projectKey}`),
		fetchTaskRuns: (module, realm, offset, limit) => module.api.get(`control.realm.${realm.id}.taskruns?offset=${offset}&limit=${limit}`),
		setParentRoute: (module, realm) => module.routeRealms.setRoute(realm ? { realmId: realm.id } : {}),
		getProjectKey: (project) => project.id,
		init: (module) => module.routeRealms.addTool({
			id: 'taskRuns',
			type: 'button',
			sortOrder: 10,
			condition: (realm) => realm.apiType == 'node',
			componentFactory: (realm) => new Elem(n => n.elem('button', { className: 'iconbtn medium', events: {
				click: (c, ev) => {
					ev.stopPropagation();
					module.self.setRoute('realm', { projectKey: realm.id });
				},
			}}, [
				n.component(new FAIcon('cogs')),
			])),
		}),
		dispose: (module) => module.routeRealms.removeTool('taskRuns'),
		pathDef: [
			[ 'taskrun', '$taskRunId', 'page', '$pageNr', 'step', '$step' ],
			[ 'taskrun', '$taskRunId', 'step', '$step' ],
			[ 'taskrun', '$taskRunId', 'page', '$pageNr' ],
			[ 'taskrun', '$taskRunId' ],
			[ 'realm', '$projectKey', 'page', '$pageNr' ],
			[ 'realm', '$projectKey' ],
		],
		txtTaskRuns: l10n.l('routeTaskRuns.realmTaskRuns', "Realm task runs"),
		txtBackToProjects: l10n.l('routeTaskRuns.backToRealms', "Back to realms"),
		txtNoTaskRunsPlaceholder: l10n.l('routeTaskRuns.noRealmTaskRuns', "No task runs for this realm."),
		txtTaskRun: l10n.l('routeTaskRuns.realmTaskRun', "Realm task run"),
	},
};

export default types;
