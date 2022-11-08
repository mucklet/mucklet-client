import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'list taggroups';
const shortDesc = 'List all tag groups';
const helpText =
`<p>List all tag groups in sorted order.</p>
<p>Alias: <code>list taggroup</code></p>`;

/**
 * ListTagGroups adds command to list all tag groups.
 */
class ListTagGroups {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'helpAdmin', 'tags' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'taggroups',
			alias: [ 'taggroup' ],
			value: (ctx, p) => this.listTagGroups(ctx.char),
		});

		this.module.helpAdmin.addTopic({
			id: 'listTagGroups',
			cmd: 'list taggroups',
			usage: l10n.l('listTagGroups.usage', usageText),
			shortDesc: l10n.l('listTagGroups.shortDesc', shortDesc),
			desc: l10n.l('listTagGroups.helpText', helpText),
			sortOrder: 440,
		});
	}

	listTagGroups(char) {
		let list = [];
		for (let m of this.module.tags.getGroupsCollection()) {
			list.push(
				'<tr>' +
				'<td><code class="common--nowrap">' + escapeHtml(m.key) + '</code></td>' +
				'<td>' + escapeHtml(m.name) + '</td>' +
				'<td>' + (m.order ? String(m.order) : '') + '</td>' +
				'</tr>',
			);
		}
		if (list.length) {
			this.module.charLog.logComponent(char, 'listTagGroups', new Elem(n => n.elem('div', { className: 'listtags charlog--pad' }, [
				n.component(new Txt(l10n.l('listTagGroups.tagGroups', "Tag groups"), { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.component(new Html('<table class="tbl-small"><thead><tr>' +
						'<th>' + escapeHtml(l10n.t('listTagGroups.keyword', "Keyword")) + '</th>' +
						'<th>' + escapeHtml(l10n.t('listTagGroups.name', "Name")) + '</th>' +
						'<th>' + escapeHtml(l10n.t('listTagGroups.sortOrder', "Sort order")) + '</th>' +
						'</tr></thead>' +
						'<tbody>' + list.join('') + '</tbody>',
					)),
				]),
			])));
		} else {
			this.module.charLog.logInfo(char, l10n.l('listTagGroups.noTagGroups', "There are no tag groups."));
		}
	}
}

export default ListTagGroups;
