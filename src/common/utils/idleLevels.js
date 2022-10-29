import l10n from 'modapp-l10n';

const idleLevels = [
	{ text: l10n.l('pageRealm.asleep', "Asleep"), className: 'common--level-asleep' },
	{ text: l10n.l('pageRealm.active', "Active"), className: 'common--level-active' },
	{ text: l10n.l('pageRealm.idle', "Idle"), className: 'common--level-idle' },
	{ text: l10n.l('pageRealm.away', "Away"), className: 'common--level-inactive' },
];

export default idleLevels;
