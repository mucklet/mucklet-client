import l10n from 'modapp-l10n';
import './projectStates.scss';

const states = {
	offline: { text: l10n.l('projectStates.offline', "Offline"), className: 'projectstates--offline', transitional: false },
	online: { text: l10n.l('projectStates.online', "Online"), className: 'projectstates--online', transitional: false },
	stopped: { text: l10n.l('projectStates.stopped', "Stopped"), className: 'projectstates--stopped', transitional: false },
	undefined: { text: l10n.l('projectStates.undefined', "Undefined"), className: 'projectstates--undefined', transitional: false },
	booting: { text: l10n.l('projectStates.booting', "Booting"), className: 'projectstates--booting', transitional: true },
	restarting: { text: l10n.l('projectStates.restarting', "Restarting"), className: 'projectstates--restarting', transitional: true },
	resyncing: { text: l10n.l('projectStates.resyncing', "Resyncing"), className: 'projectstates--resyncing', transitional: true },
	stopping: { text: l10n.l('projectStates.stopping', "Stopping"), className: 'projectstates--stopping', transitional: true },
	shuttingDown: { text: l10n.l('projectStates.shuttingDown', "Shutting down"), className: 'projectstates--shuttindown', transitional: true },
};

const projectStates = [
	states.offline,
	states.online,
	states.stopped,
	states.undefined,
	states.booting,
	states.restarting,
	states.resyncing,
	states.stopping,
	states.shuttingDown,
];

export default projectStates;

/**
 * Returns an object with localization and colorization for visualizing a
 * project's state. If the state is unknown, the offline state object is
 * returned.
 * @param {{ state?: "offline" | "online" | "stopped" | "undefined" | "booting" | "restarting" | "resyncing" | "stopping" | "shuttingDown" }} project Project object with state, such as realm or node model.
 * @param {string} [prop] Property name. Defaults to "state".
 * @returns {{ text: LocaleString, className: string, transitional: bool }}
 * State object.
 */
export function getProjectState(project, prop = "state") {
	return states[project?.[prop]] || states.offline;
}
