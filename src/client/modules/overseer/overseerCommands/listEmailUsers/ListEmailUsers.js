import { Elem, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import formatDateTime from 'utils/formatDateTime';
import escapeHtml from 'utils/escapeHtml';
import './listEmailUsers.scss';

const usageText = 'list emailusers <span class="param">Email</span>';
const shortDesc = 'List users by email';
const helpText =
`<p>List user accounts associated with an email address.</p>
<p><code class="param">Email</code> is the email address.</p>`;

const txtNoMatchingUsers = l10n.l('listEmailUsers.noMatchingUsers', "No users matching the email address.");
const txtUserId = l10n.t('listEmailUsers.id', "User ID");
const txtName = l10n.t('listEmailUsers.name', "Name");
const txtRegistered = l10n.t('listEmailUsers.registered', "Registered");
const txtProvider = l10n.t('listEmailUsers.provider', "Provider");
const txtEmail = l10n.t('listEmailUsers.email', "Email");

/**
 * ListEmailUsers gets user info properties.
 */
class ListEmailUsers {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'player', 'cmdLists', 'helpOverseer', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'emailusers',
			next: [
				new TextStep('email', {
					name: "email",
					token: 'listitem',
					spellcheck: false,
				}),
			],
			value: (ctx, p) => this._listEmailUsers(ctx, p),
		});

		this.module.helpOverseer.addTopic({
			id: 'listEmailUsers',
			cmd: 'list emailusers',
			usage: l10n.l('listEmailUsers.usage', usageText),
			shortDesc: l10n.l('listEmailUsers.shortDesc', shortDesc),
			desc: l10n.l('listEmailUsers.helpText', helpText),
			sortOrder: 240,
		});
	}

	_listEmailUsers(ctx, p) {
		return this.module.api.call('identity.overseer', 'getUsersByEmail', { email: p.email.trim() }).then(result => {
			let users = result.users;

			if (!users?.length) {
				this.module.charLog.logInfo(ctx.char, txtNoMatchingUsers);
				return;
			}

			let hasOpenId = false;
			for (let m of users) {
				if (m.openIdProvider) {
					hasOpenId = true;
					break;
				}
			}

			let rows = [];
			for (let m of users) {
				let idClass = m.deleted
					? 'listemailusers--deleted'
					: m.banned
						? 'listemailusers--banned'
						: null;
				let emailClass = m.emailVerified ? null : 'listemailusers--notverified';
				rows.push('<tr>' +
					'<td' + (idClass ? ' class="' + idClass + '"' : '') + '><code>#' + escapeHtml(m.id) + '</code></td>' +
					'<td>' + escapeHtml(m.name) + '</td>' +
					'<td>' + escapeHtml(formatDateTime(new Date(m.created), { showYear: true })) + '</td>' +
					(hasOpenId ? '<td>' + escapeHtml(m.openIdProvider) + '</td>' : '') +
					'<td' + (emailClass ? ' class="' + emailClass + '"' : '') + '>' + escapeHtml(m.email) + '</td>' +
					'</tr>',
				);
			}

			let elem = new Elem(n => n.elem('div', { className: 'charlog--pad' }, [
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html('<tr>' +
							'<th class="charlog--strong">' + escapeHtml(txtUserId) + '</th>' +
							'<th class="charlog--strong">' + escapeHtml(txtName) + '</th>' +
							'<th class="charlog--strong">' + escapeHtml(txtRegistered) + '</th>' +
							(hasOpenId ? '<th class="charlog--strong">' + escapeHtml(txtProvider) + '</th>' : '') +
							'<th class="charlog--strong">' + escapeHtml(txtEmail) + '</th>' +
							'</tr>', { tagName: 'thead' },
						)),
						n.component(new Html(rows.join(''), { tagName: 'tbody' })),
					]),
				]),
			]));

			this.module.charLog.logComponent(ctx.char, 'listEmailUsers', elem);
		});
	}
}

export default ListEmailUsers;
