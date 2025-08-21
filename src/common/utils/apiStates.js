import l10n from 'modapp-l10n';
import './apiStates.scss';

const states = {
	offline: { text: l10n.l('apiStates.offline', "Offline"), className: 'apistates--offline', transitional: false },
	online: { text: l10n.l('apiStates.online', "Online"), className: 'apistates--online', transitional: false },
	stopped: { text: l10n.l('apiStates.stopped', "Stopped"), className: 'apistates--stopped', transitional: false },
	undefined: { text: l10n.l('apiStates.undefined', "Undefined"), className: 'apistates--undefined', transitional: false },
	booting: { text: l10n.l('apiStates.booting', "Booting"), className: 'apistates--booting', transitional: true },
	restarting: { text: l10n.l('apiStates.restarting', "Restarting"), className: 'apistates--restarting', transitional: true },
	resyncing: { text: l10n.l('apiStates.resyncing', "Resyncing"), className: 'apistates--resyncing', transitional: true },
	stopping: { text: l10n.l('apiStates.stopping', "Stopping"), className: 'apistates--stopping', transitional: true },
	shuttingDown: { text: l10n.l('apiStates.shuttingDown', "Shutting down"), className: 'apistates--shuttindown', transitional: true },
};

const apiStates = [
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

export default apiStates;

/**
 * Returns an object with localization and colorization for visualizing a
 * realm's API state. If the state is unknown, the offline state object is returned.
 * @param {{ apiState?: "offline" | "online" | "stopped" | "undefined" | "booting" | "restarting" | "resyncing" | "stopping" | "shuttingDown" }} realm Realm object with state.
 * @param {string} [prop] Property name. Defaults to "apiState".
 * @returns {{ text: LocaleString, className: string, transitional: bool }} State object.
 */
export function getApiState(realm, prop = "apiState") {
	return states[realm?.[prop]] || states.offline;
}
