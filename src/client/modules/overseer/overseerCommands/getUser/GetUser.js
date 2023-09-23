import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';
import IDStep from 'classes/IDStep';
import Err from 'classes/Err';
import formatDateTime from 'utils/formatDateTime';
import escapeHtml from 'utils/escapeHtml';
import './getUser.scss';

const usageText = 'get user <span class="param">#UserID<span class="comment">/</span>@Username<span class="comment">/</span>Character</span>';
const shortDesc = 'Get user account information';
const helpText =
`<p>Get account information about a user.</p>
<p><code class="param">#UserID</code> is the ID of the user.</p>
<p><code class="param">@Username</code> is the username.</p>
<p><code class="param">Character</code> is the name of a character owned by the user.</p>`;
const examples = [
	{ cmd: 'get user @jane_doe', desc: l10n.l('getUser.exampleGetUserByUsername', "Gets user with username <code>jane_doe</code>.") },
];

/**
 * GetUser gets user info properties.
 */
class GetUser {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'cmdLists', 'helpOverseer', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('get', {
			key: 'user',
			next: [
				new IDStep('userId', {
					name: "user ID, name, or character",
					else: new DelimStep("@", {
						next: new TextStep('username', {
							name: "username",
							token: 'listitem',
							spellcheck: false,
						}),
						else: new ListStep('charId', this.module.cmdLists.getAllChars(), {
							textId: 'charName',
							name: "user",
							errRequired: step => new Err('getUser.userRequired', "Which user?"),
						}),
					}),
				}),
			],
			value: (ctx, p) => this._getUser(ctx, p),
		});

		this.module.helpOverseer.addTopic({
			id: 'getUser',
			cmd: 'get user',
			usage: l10n.l('getUser.usage', usageText),
			shortDesc: l10n.l('getUser.shortDesc', shortDesc),
			desc: l10n.l('getUser.helpText', helpText),
			examples,
			sortOrder: 200,
		});
	}

	_getUser(ctx, p) {
		let mod = this.module.player;
		return (p.userId
			? Promise.resolve({ id: p.userId })
			: p.username
				? this.module.api.call('identity.overseer', 'getUserByUsername', { username: p.username.trim() })
				: mod.getPlayer().call('getUser', p.charId
					? { charId: p.charId }
					: { charName: p.charName },
				)
		).then(user => Promise.all([
			this.module.api.get('identity.user.' + user.id),
			this.module.api.call('identity.user.' + user.id, 'getIps'),
		])).then(result => {
			let identity = result[0];
			let ips = result[1].ips;

			let addrs = [];
			for (let m of ips) {
				addrs.push('<tr>' +
					'<td>' + escapeHtml(m.ip) + '</td>' +
					'<td>' + escapeHtml(formatDateTime(new Date(m.firstUsed), { showYear: true })) + '</td>' +
					'<td>' + escapeHtml(formatDateTime(new Date(m.lastUsed), { showYear: true })) + '</td>' +
					'<td>' + escapeHtml(m.used) + '</td>' +
					'</tr>',
				);
			}

			let elem = new Elem(n => n.elem('div', { className: 'charlog--pad' }, [
				n.component(new Txt(l10n.t('getUser.playerInfo', "User info"), { tagName: 'h4' })),
				n.elem('table', { className: 'tbl-small tbl-nomargin charlog--font-small' }, [
					[ "ID", "#" + identity.id ],
					[ "Name", identity.name ],
					[ "Login name", identity.username || "-" ],
					[ "ID Roles", identity.idRoles && identity.idRoles.join(", ") || "-" ],
					[ "Email", identity.email || "-" ],
					[ "Email verified", identity.emailVerified ? "Yes" : "No" ],
					[ "Has OpenID", identity.hasOpenId ? "Yes" : "No" ],
					[ "Registered", formatDateTime(new Date(identity.created)) ],
				].filter(m => m).map(m => n.elem('tr', [
					n.elem('td', { className: 'charlog--strong' }, [
						n.component(new Txt(m[0])),
					]),
					n.elem('td', [
						n.component(new Txt(m[1])),
					]),
				]))),
				n.component(new Txt(l10n.t('getUser.userIps', "User IPs"), { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html('<tr>' +
							'<th class="charlog--strong">' + escapeHtml(l10n.t('getUser.ip', "IP")) + '</th>' +
							'<th class="charlog--strong">' + escapeHtml(l10n.t('getUser.firstSeen', "First seen")) + '</th>' +
							'<th class="charlog--strong">' + escapeHtml(l10n.t('getUser.lastSeen', "Last seen")) + '</th>' +
							'<th class="charlog--strong">' + escapeHtml(l10n.t('getUser.count', "Count")) + '</th>' +
							'</tr>', { tagName: 'thead' },
						)),
						n.component(new Html(addrs.join(''), { tagName: 'tbody' })),
					]),
				]),
			]));

			this.module.charLog.logComponent(ctx.char, 'getUser', elem);
		});
	}
}

export default GetUser;
