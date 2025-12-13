import l10n from 'modapp-l10n';
import './containerStates.scss';

const states = {
	created: { text: l10n.l('containerStates.created', "Created"), className: 'containerstates--created', transitional: false },
	running: { text: l10n.l('containerStates.running', "Running"), className: 'containerstates--running', transitional: false },
	paused: { text: l10n.l('containerStates.paused', "Paused"), className: 'containerstates--paused', transitional: false },
	restarting: { text: l10n.l('containerStates.restarting', "Restarting"), className: 'containerstates--restarting', transitional: false },
	removing: { text: l10n.l('containerStates.removing', "Removing"), className: 'containerstates--removing', transitional: false },
	exited: { text: l10n.l('containerStates.exited', "Exited"), className: 'containerstates--exited', transitional: false },
	dead: { text: l10n.l('containerStates.dead', "Dead"), className: 'containerstates--dead', transitional: false },
	unknown: { text: l10n.l('containerStates.unknown', "Unknown"), className: 'containerstates--unknown', transitional: false },
};

const containerStates = [
	states.created,
	states.running,
	states.paused,
	states.restarting,
	states.removing,
	states.exited,
	states.dead,
	states.unknown,
];

export default containerStates;

/**
 * Returns an object with localization and colorization for visualizing a
 * container's state. If the state is unknown, the unknown state object is returned.
 * @param {{ state?: "created" | "running" | "paused" | "restarting" | "removing" | "exited" | "dead" }} container Realm object with state.
 * @param {string} [prop] Property name. Defaults to "state".
 * @returns {{ text: LocaleString, className: string, transitional: bool }} State object.
 */
export function getContainerState(container, prop = "state") {
	return states[container?.[prop]] || states.unknown;
}
