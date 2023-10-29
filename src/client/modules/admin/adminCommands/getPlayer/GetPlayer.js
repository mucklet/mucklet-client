import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import IDStep from 'classes/IDStep';
import Err from 'classes/Err';
import formatDateTime from 'utils/formatDateTime';
import escapeHtml from 'utils/escapeHtml';
import './getPlayer.scss';

const usageText = 'get player <span class="param">Player\'s Character<span class="comment">/</span>#PlayerID</span>';
const shortDesc = 'Get information about a player';
const helpText =
`<p>Get information about a player and all their characters.</p>
<p><code class="param">Player's Character</code> is the name of any of the characters owned by the player.</p>
<p><code class="param">#PlayerID</code> is the ID of the player.</p>
<p>Example: <code>get player Jane Doe</code></p>`;

const idleClasses = [
	'common--level-asleep',
	'common--level-active',
	'common--level-idle',
	'common--level-inactive',
];

/**
 * GetPlayer gets player properties.
 */
class GetPlayer {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'cmdLists', 'helpAdmin', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('get', {
			key: 'player',
			next: [
				new IDStep('playerId', {
					name: "player's character name or player ID",
					else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
						textId: 'charName',
						name: "player",
						errRequired: step => new Err('addPlayerRole.characterRequired', "Which player (by character)?"),
					}),
				}),
			],
			value: (ctx, p) => this._getPlayer(ctx, p),
		});

		this.module.helpAdmin.addTopic({
			id: 'getPlayer',
			cmd: 'get player',
			usage: l10n.l('getPlayer.usage', usageText),
			shortDesc: l10n.l('getPlayer.shortDesc', shortDesc),
			desc: l10n.l('getPlayer.helpText', helpText),
			sortOrder: 205,
		});
	}

	_getPlayer(ctx, p) {
		let player = this.module.player.getPlayer();
		return player.call('getUser', p).then(user => this.module.api.get('core.player.' + user.id + '.chars').then(chars => {

			try {
				let owned = [];
				for (let m of chars.toArray().sort((a, b) => b.lastAwake - a.lastAwake || a.name.localeCompare(b.name) || a.surname.localeCompare(b.surname))) {
					owned.push('<tr>' +
						'<td class="' + idleClasses[m.idle] + '">' + escapeHtml(m.name + ' ' + m.surname) + '</td>' +
						'<td>' + escapeHtml(formatDateTime(new Date(m.created), { showYear: true })) + '</td>' +
						'<td>' + escapeHtml(m.lastAwake	? formatDateTime(new Date(m.lastAwake)) : l10n.t('getPlayer.never', "Never")) + '</td>' +
						(m.suspended
							? '<td class="getplayer--suspended">' + escapeHtml(l10n.t('getPlayer.suspendedUntil', "Suspended until {timestamp}", { timestamp: formatDateTime(new Date(m.suspended)) })) + '</td>'
							: m.state == 'awake'
								? '<td class="getplayer--awake">' + escapeHtml(l10n.t('getPlayer.awake', "Awake")) + '</td>'
								: '<td class="getplayer--asleep">' + escapeHtml(l10n.t('getPlayer.asleep', "Asleep")) + '</td>'
						) +
						'</tr>');
				}

				let rows = [
					[ "ID", "#" + user.id ],
					[ "Joined", formatDateTime(new Date(user.created), { showYear: true }) ],
					[ "Roles", user.roles && user.roles.join(", ") || "-" ],
					[ "Trust", user.trust ? user.trust : "No trust flags set" ],
				];
				if (user.banned) {
					rows.push([ "Banned", formatDateTime(new Date(user.banned), { showYear: true }) ]);
				}

				let elem = new Elem(n => n.elem('div', { className: 'charlog--pad' }, [
					n.component(new Txt(l10n.t('getPlayer.playerInfo', "Player info"), { tagName: 'h4' })),
					n.elem('table', { className: 'tbl-small tbl-nomargin charlog--font-small' }, rows.map(m => n.elem('tr', [
						n.elem('td', { className: 'charlog--strong' }, [
							n.component(new Txt(m[0])),
						]),
						n.elem('td', [
							n.component(new Txt(m[1])),
						]),
					]))),
					n.component(new Txt(l10n.t('getPlayer.playerCharacters', "Player characters"), { tagName: 'h4', className: 'charlog--pad' })),
					n.elem('div', { className: 'charlog--code' }, [
						n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
							n.component(new Html('<tr>' +
								'<th class="charlog--strong">' + escapeHtml(l10n.t('getPlayer.room', "Name")) + '</th>' +
								'<th class="charlog--strong">' + escapeHtml(l10n.t('getPlayer.created', "Created")) + '</th>' +
								'<th class="charlog--strong">' + escapeHtml(l10n.t('getPlayer.lastAwake', "Last awake")) + '</th>' +
								'<th class="charlog--strong">' + escapeHtml(l10n.t('getPlayer.status', "Status")) + '</th>' +
								'</tr>', { tagName: 'thead' },
							)),
							n.component(new Html(owned.join(''), { tagName: 'tbody' })),
						]),
					]),
				]));

				this.module.charLog.logComponent(ctx.char, 'getPlayer', elem);
			} catch (ex) {
				console.error(ex);
			}
		}));
	}
}

export default GetPlayer;
