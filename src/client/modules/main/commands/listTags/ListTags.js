import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'list tags';
const shortDesc = 'List all pre-defined tags';
const helpText =
`<p>List all pre-defined tags.</p>
<p>Alias: <code>list tag</code></p>`;

/**
 * ListTags adds command to list all global tags.
 */
class ListTags {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help', 'tags', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'tags',
			alias: [ 'tag' ],
			value: (ctx, p) => this.listTags(ctx.char),
		});

		this.module.help.addTopic({
			id: 'listTags',
			category: 'tags',
			cmd: 'list tags',
			alias: [ 'list tag' ],
			usage: l10n.l('listTags.usage', usageText),
			shortDesc: l10n.l('listTags.shortDesc', shortDesc),
			desc: l10n.l('listTags.helpText', helpText),
			sortOrder: 20,
		});
	}

	listTags(char) {
		let sections = [];
		for (let g of this.module.tags.getGroupsCollection()) {
			this._addSection(g, sections);
		}
		let skipHeader = !sections.length;
		this._addSection(
			{ name: l10n.t('listTags.other', "Other") },
			sections,
			skipHeader,
		);
		this._addSection(
			{ name: l10n.t('listTags.titles', "Titles") },
			sections,
			skipHeader,
			true,
		);

		if (sections.length) {
			this.module.charLog.logComponent(char, 'listTags', new Elem(n => n.elem('div', { className: 'listtags charlog--pad' }, [
				n.component(new Txt(l10n.l('listTags.tags', "Tags"), { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.html('<table class="tbl-small' + (skipHeader ? ' tbl-nomargin' : '') + '"><tbody>' + sections.join('') + '</tbody></table>'),
				]),
			])));
		} else {
			this.module.charLog.logInfo(char, l10n.l('listTags.noTags', "There are no tags defined."));
		}
	}

	_addSection(group, sections, skipHeader, hasRole) {
		hasRole = !!hasRole;
		let mod = this.module.tags;
		let groups = mod.getGroups().props;
		let key = group.key;
		let list = [];
		for (let m of mod.getTagsCollection()) {
			if (key ? m.group == key : !m.group || !groups[m.group]) {
				let isRoleTag = !!(m.role || m.idRole);
				if (isRoleTag == hasRole) {
					list.push('<tr><td><code class="common--nowrap">' + (isRoleTag ? '<em>' + escapeHtml(m.key) + '</em>' : escapeHtml(m.key)) + '</code></td><td>' + escapeHtml(m.desc) + '</td></tr>');
				}
			}
		}
		if (list.length) {
			sections.push(
				(skipHeader ? '' : '<tr class="tbl-hr tbl-header' + (sections.length ? ' tbl-padtop' : '') + '"><td colspan="2">' + escapeHtml(group.name) + '</td></tr>') +
				list.join(''),
			);
		}
	}
}

export default ListTags;
