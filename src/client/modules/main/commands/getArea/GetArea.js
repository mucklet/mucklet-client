import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';

const usageText = 'get area <span class="param">Attribute</span>';
const shortDesc = 'Get info about the area of current room';
const helpText =
`<p>Get the value of an attribute for the area you are in.</p>
<table class="tbl-small">
<thead><tr><th><code class="param">Attribute</code></th><th>Value</th></tr></thead>
<tbody>
<tr><td><code>id</code></td><td>ID of the area.</td></tr>
<tr><td><code>owner</code></td><td>Owner of the area.</td></tr>
</tbody>
</table>`;

/**
 * GetArea adds command to print area info.
 */
class GetArea {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.areaAttr = new ItemList({
			items: [
				{ key: 'id' },
				{ key: 'owner' }
			]
		});

		this.module.cmd.addPrefixCmd('get', {
			key: 'area',
			next: new ListStep('attr', this.areaAttr, {
				name: "area attribute",
				token: 'attr'
			}),
			value: (ctx, p) => this.getArea(ctx.char, p.attr)
		});

		this.module.help.addTopic({
			id: 'getArea',
			category: 'buildAreas',
			cmd: 'get area',
			usage: l10n.l('getArea.usage', usageText),
			shortDesc: l10n.l('getArea.shortDesc', shortDesc),
			desc: l10n.l('getArea.helpText', helpText),
			sortOrder: 30,
		});
	}

	getArea(char, attr) {
		let a = char.inRoom.area;
		if (!a) {
			this.module.charLog.logError(char, { code: 'getArea.roomHasNoArea', message: "This room doesn't belong to an area." });
		} else {
			switch (attr) {
				case 'id':
					this.module.charLog.logInfo(char, l10n.l('getArea.areaHasId', "{name} has ID #{areaId}", { name: a.name.replace(/([^.])\.$/, "$1"), areaId: a.id }));
					break;
				case 'owner':
					this.module.charLog.logInfo(char, l10n.l('getArea.areaHasOwner', "{name} has owner {owner}", { name: a.name.replace(/([^.])\.$/, "$1"), owner: (a.owner.name + " " + a.owner.surname).trim() }));
					break;
			}
		}
	}
}

export default GetArea;
