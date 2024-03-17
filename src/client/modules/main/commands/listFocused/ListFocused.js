import { Elem, Txt, Html } from 'modapp-base-component';
import escapeHtml from 'utils/escapeHtml';
import l10n from 'modapp-l10n';

const usageText = "list focused";
const shortDesc = "List characters focused by the currently controlled character";
const helpText =
`<p>Get a list of your character's focus targets.</p>
<p>Alias: <code>list focus</code></p>`;

/**
 * ListFocused adds a command to list current focus targets.
 */
class ListFocused {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'charFocus',
			'help',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('list', {
			key: 'focused',
			alias: [ 'focus' ],
			value: (ctx, p) => this.listFocused(ctx.char),
		});

		this.module.help.addTopic({
			id: 'listFocused',
			category: 'friends',
			cmd: 'list focused',
			alias: [ 'list focus' ],
			usage: l10n.l('listFocused.usage', usageText),
			shortDesc: l10n.l('listFocused.shortDesc', shortDesc),
			desc: l10n.l('listFocused.helpText', helpText),
			sortOrder: 35,
		});
	}

	listFocused(ctrl) {
		let ctrlId = ctrl.id;
		let focusList = this.module.charFocus.getFocusCharColors(ctrlId);

		if (!focusList){
			this.module.charLog.logInfo(ctrl, l10n.l('listFocused.noFocuses', "{charName} has no focused characters.", { charName: ctrl.name }));
			return;
		}

		let outputList = focusList.map(o => (`<tr>
			<td>${escapeHtml(o.char.name + ' ' + o.char.surname)}</td>
			<td><i style="color:${o.hex}" class="fa fa-circle" aria-hidden></i></td><td>${escapeHtml(o.color)}</div></td></tr>`
		));

		this.module.charLog.logComponent(ctrl, 'listFocused', new Elem(n => n.elem('div', { className: 'listfocused charlog--pad' }, [
			n.component(new Txt(l10n.l('listFocused.charFocusColors', "Character focus colors"), { tagName: 'h4', className: 'charlog--pad' })),
			n.elem('div', { className: 'charlog--code' }, [
				n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
					n.component(new Html(outputList.join(''), { tagName: 'tbody' })),
				]),
			]),
		])));
	}
}

export default ListFocused;
