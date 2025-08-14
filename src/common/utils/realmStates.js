import l10n from 'modapp-l10n';
import './realmStates.scss';

const states = {
	offline: { text: l10n.l('realmStates.offline', "Offline"), className: 'realmstates--offline' },
	online: { text: l10n.l('realmStates.online', "Online"), className: 'realmstates--online' },
	booting: { text: l10n.l('realmStates.booting', "Booting"), className: 'realmstates--booting' },
	restarting: { text: l10n.l('realmStates.restarting', "Restarting"), className: 'realmstates--restarting' },
	stopped: { text: l10n.l('realmStates.stopped', "Stopped"), className: 'realmstates--stopped' },
};

const realmStates = [
	states.offline,
	states.online,
	states.booting,
	states.restarting,
	states.stopped,
];

export default realmStates;

/**
 * Returns an object with localization and colorization for visualizing a
 * realm's state. If the state is unknown, the offline state object is returned.
 * @param {{ state?: "offline" | "online" | "booting" | "restarting" | "stopped" }} realm Realm object with state.
 * @returns {{ text: LocaleString, className: string }} State object.
 */
export function getRealmState(realm) {
	return states[realm?.state] || states.offline;
}
