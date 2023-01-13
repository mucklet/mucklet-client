import l10n from 'modapp-l10n';

const levels = {
	asleep: { text: l10n.l('idleLevels.asleep', "Asleep"), className: 'common--level-asleep' },
	active: { text: l10n.l('idleLevels.active', "Active"), className: 'common--level-active' },
	idle: { text: l10n.l('idleLevels.idle', "Idle"), className: 'common--level-idle' },
	away: { text: l10n.l('idleLevels.away', "Away"), className: 'common--level-inactive' },
	bot: { text: l10n.l('idleLevels.bot', "Bot"), className: 'common--level-bot' },
};

const idleLevels = [
	levels.asleep,
	levels.active,
	levels.idle,
	levels.away,
	levels.bot,
];

export default idleLevels;

export function getCharIdleLevel(char) {
	if (!char) return null;

	return char.controller == 'bot'
		? levels.bot
		: idleLevels[char.idle];
}
