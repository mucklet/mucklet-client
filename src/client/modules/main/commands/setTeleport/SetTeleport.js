import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';
import { keyTooLong } from 'utils/cmdErr';

const usageText = 'set teleport <span class="param">Keyword</span> : <span class="param">Attribute</span> = <span class="param">Value</span>';
const shortDesc = 'Set a teleport destination attribute';
const helpText =
`<p>Set a teleport destination attribute.</p>
<p><code class="param">Keyword</code> is the keyword of the teleport destination to set.</p>`;

const defaultAttr = [
	{
		key: 'keyword',
		value: 'key',
		stepFactory: module => new TextStep('value', {
			regex: /^[\w\s]*\w/,
			name: "teleport node keyword",
			maxLength: () => module.info.getCore().keyMaxLength,
			errTooLong: keyTooLong,
		}),
		desc: l10n.l('setTeleportDesc', "A new destination keyword."),
		sortOrder: 20,
	},
];

/**
 * SetTeleport adds command to set teleport attributes.
 */
class SetTeleport {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.nodeAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'teleport',
			next: [
				new ListStep('nodeId', this.module.cmdLists.getTeleportNodes(), {
					name: "teleport node",
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.nodeAttr, {
					name: "teleport node attribute",
					token: 'attr',
				}),
			],
			value: (ctx, p) => this.setTeleport(ctx.char, {
				nodeId: p.nodeId,
				[p.attr]: p.value,
			}),
		});

		this.module.help.addTopic({
			id: 'setTeleport',
			category: 'transport',
			cmd: 'set teleport',
			usage: l10n.l('setTeleport.usage', usageText),
			shortDesc: l10n.l('setTeleport.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setTeleport.helpText', helpText), this.nodeAttr.getItems()),
			sortOrder: 230,
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		next = next || [
			new DelimStep("=", { errRequired: null }),
			attr.stepFactory
				? attr.stepFactory(this.module)
				: new TextStep('value', {
					name: attr.name || attr.key,
				}),
		];
		this.nodeAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	setTeleport(char, params) {
		return char.call('setTeleport', params).then(() => {
			this.module.charLog.logInfo(char, l10n.l('setTeleport.updatedTeleportNode', "Teleport node was successfully set."));
		});
	}
}

export default SetTeleport;
