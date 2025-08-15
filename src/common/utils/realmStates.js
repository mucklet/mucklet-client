import l10n from 'modapp-l10n';
import './realmStates.scss';

const states = {
	offline: { text: l10n.l('realmStates.offline', "Offline"), className: 'realmstates--offline', transitional: false },
	online: { text: l10n.l('realmStates.online', "Online"), className: 'realmstates--online', transitional: false },
	stopped: { text: l10n.l('realmStates.stopped', "Stopped"), className: 'realmstates--stopped', transitional: false },
	undefined: { text: l10n.l('realmStates.undefined', "Undefined"), className: 'realmstates--undefined', transitional: false },
	booting: { text: l10n.l('realmStates.booting', "Booting"), className: 'realmstates--booting', transitional: true },
	restarting: { text: l10n.l('realmStates.restarting', "Restarting"), className: 'realmstates--restarting', transitional: true },
	resyncing: { text: l10n.l('realmStates.resyncing', "Resyncing"), className: 'realmstates--resyncing', transitional: true },
	stopping: { text: l10n.l('realmStates.stopping', "Stopping"), className: 'realmstates--stopping', transitional: true },
	shuttingDown: { text: l10n.l('realmStates.shuttingDown', "Shutting down"), className: 'realmstates--shuttindown', transitional: true },
};

const realmStates = [
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

export default realmStates;

/**
 * Returns an object with localization and colorization for visualizing a
 * realm's state. If the state is unknown, the offline state object is returned.
 * @param {{ state?: "offline" | "online" | "stopped" | "undefined" | "booting" | "restarting" | "resyncing" | "stopping" | "shuttingDown" }} realm Realm object with state.
 * @returns {{ text: LocaleString, className: string, transitional: bool }} State object.
 */
export function getRealmState(realm) {
	return states[realm?.state] || states.offline;
}
