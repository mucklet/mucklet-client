import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import FormatTxt from 'components/FormatTxt';
import Err from 'classes/Err';
import './aboutArea.scss';

const usageText = 'about area';
const shortDesc = 'Show area about info of current location';
const helpText =
`<p>Show the about information for the area you are in.</p>`;

/**
 * AboutArea adds command to print area about info.
 */
class AboutArea {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('about', {
			key: 'area',
			value: (ctx, p) => this.aboutArea(ctx.char, p.attr),
		});

		this.module.help.addTopic({
			id: 'aboutArea',
			category: 'buildAreas',
			cmd: 'about area',
			usage: l10n.l('aboutArea.usage', usageText),
			shortDesc: l10n.l('aboutArea.shortDesc', shortDesc),
			desc: l10n.l('aboutArea.helpText', helpText),
			sortOrder: 70,
		});
	}

	aboutArea(char, attr) {
		let a = char.inRoom.area;
		if (!a) {
			this.module.charLog.logError(char, new Err('aboutArea.roomHasNoArea', "This room doesn't belong to an area."));
			return;
		}

		let name = a.name.replace(/([^.])\.$/, "$1");
		let about = a.about;
		if (!about) {
			this.module.charLog.logInfo(char, l10n.t('aboutArea.areaHasNoAbout', "{name} has no about information.", { name }));
			return;
		}

		this.module.charLog.logComponent(char, 'aboutArea', new Elem(n => n.elem('div', { className: 'aboutarea' }, [
			n.component(new Txt(l10n.t('aboutArea.aboutArea', "About {name}", { name }), { tagName: 'h3', className: 'margin-bottom-l' })),
			n.component(new FormatTxt(about, { className: 'area--about formattxt-charlog', noInteraction: true })),
		])));
	}
}

export default AboutArea;
