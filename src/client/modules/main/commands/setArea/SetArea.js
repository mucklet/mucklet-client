import l10n from 'modapp-l10n';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import TextStep from 'classes/TextStep';
import IDStep from 'classes/IDStep';
import ItemList from 'classes/ItemList';
import helpAttribDesc from 'utils/helpAttribDesc';
import { descriptionTooLong, shortDescriptionTooLong, itemNameTooLong } from 'utils/cmdErr';

const usageText = 'set area <span class="param">#AreaID<span class="comment">/</span>Area</span> : <span class="param">Attribute</span> = <span class="param">Value</span>';
const shortDesc = 'Set an area attribute';
const helpText =
`<p>Set an area attribute.</p>
<code class="param">#AreaID</code> is the ID of the area to set.</p>
<code class="param">Area</code> is the name of an owned area to set.</p>`;

const defaultAttr = [
	{
		key: 'name',
		stepFactory: module => new TextStep('value', {
			name: "area name",
			maxLength: () => module.info.getCore().itemNameMaxLength,
			errTooLong: itemNameTooLong,
		}),
		desc: l10n.l('setArea.nameDesc', "Name of the area."),
		sortOrder: 10,
	},
	{
		key: 'desc',
		value: 'shortDesc',
		stepFactory: module => new TextStep('value', {
			name: "area short description",
			spanLines: true,
			maxLength: () => module.info.getCore().shortDescriptionMaxLength,
			errTooLong: shortDescriptionTooLong,
		}),
		desc: l10n.l('setRoom.descDesc', "Short description of the area. May span multiple paragraphs."),
		sortOrder: 20,
	},
	{
		key: 'about',
		stepFactory: module => new TextStep('value', {
			name: "about the area",
			spanLines: true,
			maxLength: () => module.info.getCore().descriptionMaxLength,
			errTooLong: descriptionTooLong,
		}),
		desc: l10n.l('setChar.aboutDesc', "Information about the area, such as setting, purpose, and rules. It may be formatted and span multiple paragraphs."),
		sortOrder: 30,
	},
	{
		key: 'rules',
		stepFactory: module => new TextStep('value', {
			name: "area rules",
			spanLines: true,
			maxLength: () => module.info.getCore().descriptionMaxLength,
			errTooLong: descriptionTooLong,
		}),
		desc: l10n.l('setChar.rulesDesc', "Area specific rules that adds to the realm rules. It may be formatted and span multiple paragraphs."),
		sortOrder: 40,
	},
	{
		key: 'parent',
		value: 'parentId',
		stepFactory: module => new IDStep('value', {
			name: "parent area ID",
			list: () => {
				let c = module.player.getActiveChar();
				return ((c && c.ownedAreas && c.ownedAreas.toArray()) || []).map(v => v.id);
			},
			else: new ListStep('value', module.cmdLists.getCharOwnedAreas(true), {
				name: "parent area",
			}),
		}),
		desc: l10n.l('setArea.parentDesc', "#AreaID, or name of owned area, to set as parent area. Or <code>none</code> to unset current parent area. List owned areas with <code>list areas</code>."),
		sortOrder: 50,
	},
];

/**
 * SetArea adds command to set the area attributes.
 */
class SetArea {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help', 'player', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.areaAttr = new ItemList({
			compare: (a, b) => (a.sortOrder - b.sortOrder) || a.key.localeCompare(b.key),
		});
		for (let o of defaultAttr) {
			this.addAttribute(o);
		}

		this.module.cmd.addPrefixCmd('set', {
			key: 'area',
			next: [
				new IDStep('areaId', {
					name: "area ID",
					list: () => {
						let c = this.module.player.getActiveChar();
						return ((c && c.ownedAreas && c.ownedAreas.toArray()) || []).map(v => v.id);
					},
					else: new ListStep('areaId', this.module.cmdLists.getCharOwnedAreas(), {
						name: "area",
					}),
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', this.areaAttr, {
					name: "area attribute",
					token: 'attr',
				}),
			],
			value: this._exec.bind(this),
		});

		this.module.help.addTopic({
			id: 'setArea',
			category: 'buildAreas',
			cmd: 'set area',
			usage: l10n.l('setArea.usage', usageText),
			shortDesc: l10n.l('setArea.shortDesc', shortDesc),
			desc: () => helpAttribDesc(l10n.t('setArea.helpText', helpText), this.areaAttr.getItems()),
			sortOrder: 20,
		});
	}

	addAttribute(attr) {
		let next = attr.nextFactory ? attr.nextFactory(this.module) : attr.next;
		if (!next) {
			next = attr.stepFactory
				? attr.stepFactory(this.module)
				: new TextStep('value', {
					name: attr.name || attr.key,
				});
			next = Array.isArray(next) ? next : [ next ];
			next.unshift(new DelimStep("=", { errRequired: null }));
		}
		this.areaAttr.addItem(Object.assign({}, attr, { next }));
		return this;
	}

	_exec(ctx, p) {
		let f = p.attr;
		return typeof f == 'function'
			? f(ctx, p, this)
			: ctx.char.call('setArea', {
				areaId: p.areaId,
				[f]: p.value,
			}).then(() => {
				this.module.charLog.logInfo(ctx.char, l10n.l('setArea.updatedArea', "Area attribute was successfully set."));
			});;
	}
}

export default SetArea;
