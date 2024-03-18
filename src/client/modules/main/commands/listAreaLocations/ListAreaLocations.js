import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import escapeHtml from 'utils/escapeHtml';

const usageText = 'list area <span class="param">#AreaID<span class="comment">/</span>Area</span> : locations';
const shortDesc = 'List all locations of an area';
const helpText =
`<p>Get a list of all rooms and subareas belonging to an area.</p>`;

const txtRoom = l10n.l('listAreaLocations.room', "Room");
const txtSubarea = l10n.l('listAreaLocations.subarea', "Subarea");
const txtPrivateRoom = l10n.l('listAreaLocations.privateRoom', "Private room");
const txtPrivateSubarea = l10n.l('listAreaLocations.privateSubarea', "Private subarea");

function getTypeName(loc) {
	return loc.type == 'area'
		? loc.private
			? txtPrivateSubarea
			: txtSubarea
		: loc.private
			? txtPrivateRoom
			: txtRoom;
}

const typeOrder = {
	room: 0,
	instanceRoom: 0,
	area: 1,
};

/**
 * ListAreaLocations adds command to list all locations of an area.
 */
class ListAreaLocations {
	constructor(app) {
		this.app = app;

		this.app.require([
			'api',
			'cmd',
			'charLog',
			'help',
			'listArea',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.listArea.addAttribute({
			key: 'locations',
			alias: [ 'location' ],
			value: (ctx, p) => this.listLocations(ctx.char, p.areaId),
			sortOrder: 10,
		});

		this.module.help.addTopic({
			id: 'listAreaLocations',
			category: 'buildAreas',
			cmd: 'list area locations',
			usage: l10n.l('listAreaLocations.usage', usageText),
			shortDesc: l10n.l('listAreaLocations.shortDesc', shortDesc),
			desc: l10n.l('listAreaLocations.helpText', helpText),
			sortOrder: 60,
		});
	}

	listLocations(char, areaId) {
		let apiModule = this.module.api;
		return Promise.all([
			apiModule.get(`core.area.${areaId}.children`),
			apiModule.get(`core.area.${areaId}.children.private`),
		]).then(result => {
			let allChildren = Object.assign({}, result[0]?.props, result[1]?.props);
			let locations = Object.keys(allChildren).map(k => allChildren[k].toJSON?.() || {})
				.filter(m => m.id)
				.sort((a, b) => (typeOrder[a.type] - typeOrder[b.type]) || ((a.private || 0) - (b.private || 0)) || a.name.localeCompare(b.name))
				.map(m => '<tr><td><code>#' + escapeHtml(m.id) + '</code></td><td>' + escapeHtml(m.name) + '</td><td>' + escapeHtml(l10n.t(getTypeName(m))) + '</td></tr>');

			if (locations.length) {
				this.module.charLog.logComponent(char, 'listAreaLocations', new Elem(n => n.elem('div', { className: 'listareas charlog--pad' }, [
					n.component(new Txt(l10n.l('listAreaLocations.areaLocations', "Area locations"), { tagName: 'h4', className: 'charlog--pad' })),
					n.elem('div', { className: 'charlog--code' }, [
						n.elem('table', { className: 'tbl-small tbl-nomargin' }, [
							n.component(new Html('<tr><th class="charlog--strong">' +
								escapeHtml(l10n.t('listAreaLocations.locationId', "Location ID")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('listAreaLocations.name', "Name")) +
								'</th><th class="charlog--strong">' +
								escapeHtml(l10n.t('listAreaLocations.type', "Type")) +
								'</th></tr>', { tagName: 'thead' },
							)),
							n.component(new Html(locations.join(''), { tagName: 'tbody' })),
						]),
					]),
				])));
			} else {
				this.module.charLog.logInfo(char, l10n.l('listAreaLocations.noLocations', "The area has no locations."));
			}
		});
	}
}

export default ListAreaLocations;
