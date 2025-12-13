import l10n from 'modapp-l10n';

const types = {
	'realm': {
		id: 'realmreleases',
		key: 'realm',
		name: l10n.l('routeReleases.realmReleases', "Realm releases"),
		icon: 'th',
		order: 1020,
	},
	'node': {
		id: 'nodereleases',
		key: 'node',
		name: l10n.l('routeReleases.nodeReleases', "Node releases"),
		icon: 'th-large',
		order: 1021,
	},
};

export default types;
