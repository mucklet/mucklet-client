import l10n from 'modapp-l10n';
import './renderingModes.scss';

const modes = {
	smooth: { key: '', text: l10n.l('renderingModes.smooth', "Smooth"), className: '' },
	pixelated: { key: 'pixelated', text: l10n.l('renderingModes.pixelated', "Pixelated"), className: 'renderingmodes--pixelated' },
};

const renderingModes = [
	modes.smooth,
	modes.pixelated,
];

export default renderingModes;

export function getRenderingMode(mode) {
	return modes[mode] || modes[smooth];
}
