import l10n from 'modapp-l10n';
import './taskRunStates.scss';

const states = {
	none: { text: l10n.l('taskRunStates.created', "Created"), className: 'taskrunstates--none', transitional: false, icon: '', oicon: 'circle' },
	queued: { text: l10n.l('taskRunStates.queued', "Queued"), className: 'taskrunstates--queued', transitional: false, icon: 'clock-o', oicon: 'clock-o' },
	running: { text: l10n.l('taskRunStates.running', "Running"), className: 'taskrunstates--running', transitional: true, icon: 'cogs', oicon: 'cogs' },
	success: { text: l10n.l('taskRunStates.success', "Success"), className: 'taskrunstates--success', transitional: false, icon: 'check', oicon: 'check-circle' },
	warning: { text: l10n.l('taskRunStates.warning', "Warning"), className: 'taskrunstates--warning', transitional: false, icon: 'exclamation', oicon: 'exclamation-circle ' },
	error: { text: l10n.l('taskRunStates.error', "Error"), className: 'taskrunstates--error', transitional: false, icon: 'times', oicon: 'times-circle' },
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
