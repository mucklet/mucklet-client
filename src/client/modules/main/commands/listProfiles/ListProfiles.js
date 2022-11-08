import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'list profiles';
const shortDesc = "List your character's profiles";
const helpText =
`<p>Get a list of your character's profiles.</p>
<p>Alias: <code>list profile</code></p>`;

/**
 * ListProfiles adds command to list all character profiles.
 */
class ListProfiles {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'profiles',
			alias: [ 'profile' ],
			value: (ctx, p) => this.listProfiles(ctx.char),
		});

		this.module.help.addTopic({
			id: 'listProfiles',
			category: 'profile',
			cmd: 'list profiles',
			alias: [ 'list profile' ],
			usage: l10n.l('listProfiles.usage', usageText),
			shortDesc: l10n.l('listProfiles.shortDesc', shortDesc),
			desc: l10n.l('listProfiles.helpText', helpText),
			sortOrder: 120,
		});
	}

	listProfiles(char, attr) {
		let list = [];
		for (let m of char.profiles) {
			list.push('<tr><td><code>profile ' + escapeHtml(m.key) + '</code></td><td>' + escapeHtml(m.name) + '</td></tr>');
		}
		if (list.length) {
			this.module.charLog.logComponent(char, 'listProfiles', new Elem(n => n.elem('div', { className: 'listprofiles charlog--pad' }, [
				n.component(new Txt(l10n.l('listProfiles.charProfiles', "Character profiles"), { tagName: 'h4', className: 'charlog--pad' })),
				n.elem('div', { className: 'charlog--code' }, [
					n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
						n.component(new Html(list.join(''), { tagName: 'tbody' })),
					]),
				]),
			])));
		} else {
			this.module.charLog.logInfo(char, l10n.l('listProfiles.noProfiles', "{charName} has no profiles.", { charName: char.name }));
		}
	}
}

export default ListProfiles;
