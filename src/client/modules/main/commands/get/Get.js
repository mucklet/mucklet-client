import l10n from 'modapp-l10n';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';
import helpAttribDesc from 'utils/helpAttribDesc';
import fullname from 'utils/fullname';
import formatDateTime from 'utils/formatDateTime';

const usageText = 'get <span class="param">Attribute</span>';
const shortDesc = 'Get info about your character';
const helpText =
`<p>Get the value of an attribute of your character.</p>`;

const defaultAttr = [
	{
		key: 'id',
		name: "character id",
		desc: l10n.l('get.idDesc', "ID of your character."),
		sortOrder: 10,
	},
	{
		key: 'created',
		name: "character created",
		desc: l10n.l('get.createdDesc', "Creation date of your character."),
		sortOrder: 20,
	},
];

/**
 * Get adds command to get character attribute values.
 */
class Get {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'charLog',
			'help',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.charAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.help.addTopic({
			id: 'get',
			category: 'profile',
			cmd: 'get',
			usage: l10n.l('get.usage', usageText),
			shortDesc: l10n.l('get.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('get.helpText', helpText), this.charAttr.getItems(), {
				value: '',
			}),
			sortOrder: 12,
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		let item = Object.assign({}, attr, { next });
		this.charAttr.addItem(item);

		if (item.key) {
			if (!item.value) {
				item.value = (ctx, p) => this._exec(ctx.char, Object.assign({ attr: item.key }, p));
			}
			this.module.cmd.addPrefixCmd('get', item);
		}
		return this;
	}

	_exec(ctx, p) {
		let f = p.attr;
		return typeof f == 'function'
			? f(ctx, p, this)
			: this.get(ctx, p.attr);
	}

	get(char, attr) {
		switch (attr) {
			case 'id':
				this.module.charLog.logInfo(char, l10n.l('get.charHasId', "{fullname} has ID #{charId}", { fullname: fullname(char), charId: char.id }));
				break;
			case 'created':
				let c = this.module.player.getOwnedChar(char.id);
				if (!c) {
					this.module.charLog.logError(char, { code: 'get.charNotOwned', message: "You must own the character." });
				} else {
					console.log("C: ", c);
					this.module.charLog.logInfo(char, l10n.l('get.roomHasOwner', "{fullname} was created {created}", { fullname: fullname(c), created: formatDateTime(new Date(c.created), { showYear: true }) }));
				}
				break;
			default:
				this.module.charLog.logError(char, new Err('get.unknownAttribute', "Unknown attribute: {attr}", { attr }));
		}
	}
}

export default Get;
