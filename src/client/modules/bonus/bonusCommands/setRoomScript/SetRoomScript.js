import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import IDStep from 'classes/IDStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';
import { scriptTooLong, keyTooLong } from 'utils/cmdErr';

const usageText = 'set roomscript <span class="param">Keyword<span class="comment">/</span>#Script ID</span> : <span class="param">Attribute</span> = <span class="param">Value</span>';
const shortDesc = 'Set a room script attribute';
const helpText =
`<p>Set a room script attribute.</p>
<p><code class="param">Keyword</code> is the keyword for the room script.</p>
<p><code class="param">#ScriptID</code> is the ID of the script.</p>`;

const defaultAttr = [
	{
		key: 'keyword',
		value: 'key',
		stepFactory: module => new TextStep('value', {
			regex: /^[\w\s]*\w/,
			name: "room script keyword",
			maxLength: () => module.info.getCore().keyMaxLength,
			errTooLong: keyTooLong,
		}),
		desc: l10n.l('setRoomScript.keywordDesc', "Script keyword."),
		sortOrder: 10,
	},
	{
		key: 'script',
		stepFactory: module => new TextStep('value', {
			name: "room script",
			token: 'code',
			maxLength: () => module.info.getCore().scriptMaxLength,
			errTooLong: scriptTooLong,
			spanLines: true,
			spellcheck: false,
		}),
		desc: l10n.l('setRoomScript.scriptDesc', "Room script. It may be formatted and span multiple paragraphs."),
		sortOrder: 20,
	},
	{
		key: 'active',
		stepFactory: module => new ListStep('value', module.cmdLists.getBool(), { name: "active flag" }),
		desc: l10n.l('setRoomScript.activeDesc', "Flag telling if the script is active. Value is <code>yes</code> or <code>no</code>."),
		sortOrder: 30,
	},
];

/**
 * SetRoomScript adds command to set room script attributes.
 */
class SetRoomScript {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdLists',
			'charLog',
			'help',
			'info',
			'roomAccess',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.scriptAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'roomscript',
			next: [
				new IDStep('scriptId', {
					name: "script key or ID",
					else: new ListStep('scriptId', this.module.roomAccess.getInRoomScriptTokens(), {
						name: "room script",
					}),
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.scriptAttr, {
					name: "room script attribute",
					token: 'attr',
				}),
			],
			value: (ctx, p) => typeof p.attr == 'function'
				? p.attr(ctx, p)
				: this.setRoomScript(ctx.char, {
					scriptId: p.scriptId,
					[p.attr]: p.value,
				}),
		});

		this.module.help.addTopic({
			id: 'setRoomScript',
			category: 'buildRooms',
			cmd: 'set roomscript',
			usage: l10n.l('setRoomScript.usage', usageText),
			shortDesc: l10n.l('setRoomScript.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setRoomScript.helpText', helpText), this.scriptAttr.getItems()),
			sortOrder: 230,
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		next = typeof next == 'undefined'
			? [
				new DelimStep("=", { errRequired: null }),
				attr.stepFactory
					? attr.stepFactory(this.module)
					: new TextStep('value', {
						name: attr.name || attr.key,
					}),
			]
			: next;
		this.scriptAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	setRoomScript(char, params) {
		return char.call('setRoomScript', params)
			.then(result => this.module.charLog.logInfo(char, l10n.l('setRoomScript.roomScriptSet', "Successfully updated room script \"{key}\".", result.script)));
	}
}

export default SetRoomScript;
