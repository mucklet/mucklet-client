import l10n from 'modapp-l10n';
import './taskRunStates.scss';

const states = {
	none: { text: l10n.l('taskRunStates.created', "Created"), className: 'taskrunstates--none', transitional: false, icon: '' },
	queued: { text: l10n.l('taskRunStates.queued', "Queued"), className: 'taskrunstates--queued', transitional: false, icon: 'clock-o' },
	running: { text: l10n.l('taskRunStates.running', "Running"), className: 'taskrunstates--running', transitional: true, icon: 'cogs' },
	success: { text: l10n.l('taskRunStates.success', "Success"), className: 'taskrunstates--success', transitional: false, icon: 'check' },
	warning: { text: l10n.l('taskRunStates.warning', "Warning"), className: 'taskrunstates--warning', transitional: false, icon: 'exclamation' },
	error: { text: l10n.l('taskRunStates.error', "Error"), className: 'taskrunstates--error', transitional: false, icon: 'times' },
};

const taskRunStates = [
	states.none,
	states.queued,
	states.running,
	states.success,
	states.warning,
	states.error,
];

export default taskRunStates;

/**
 * Returns an object with localization and colorization for visualizing a
 * taskRun's state. If the state is unknown, the none state object is
 * returned.
 * @param {string} state State
 * @returns {{ text: LocaleString, className: string, bgClassName: string, transitional: bool }} State object.
 */
export function getTaskRunState(state) {
	return states[state] || states.none;
}
