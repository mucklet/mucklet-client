import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import FormatTxt from 'components/FormatTxt';
import Err from 'classes/Err';
import './areaRules.scss';

const usageText = 'area rules';
const shortDesc = 'Show area rules of current location';
const helpText =
`<p>Show the area specific rules for the area you are in.</p>`;

/**
 * RulesArea adds command to print area rules info.
 */
class RulesArea {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('area', {
			key: 'rules',
			value: (ctx, p) => this.areaRules(ctx.char, p.attr),
		});

		this.module.help.addTopic({
			id: 'areaRules',
			category: 'buildAreas',
			cmd: 'area rules',
			usage: l10n.l('areaRules.usage', usageText),
			shortDesc: l10n.l('areaRules.shortDesc', shortDesc),
			desc: l10n.l('areaRules.helpText', helpText),
			sortOrder: 70,
		});
	}

	areaRules(char, attr) {
		let a = char.inRoom.area;
		if (!a) {
			this.module.charLog.logError(char, new Err('areaRules.roomHasNoArea', "This room doesn't belong to an area."));
			return;
		}

		let name = a.name.replace(/([^.])\.$/, "$1");
		let rules = a.rules;
		if (!rules) {
			this.module.charLog.logInfo(char, l10n.l('areaRules.areaHasNoRoles', "{name} has no additional rules.", { name }));
			return;
		}

		this.module.charLog.logComponent(char, 'areaRules', new Elem(n => n.elem('div', { className: 'arearules' }, [
			n.component(new Txt(l10n.t('areaRules.areaRules', "{name} rules", { name }), { tagName: 'h3', className: 'margin-bottom-l' })),
			n.component(new FormatTxt(rules, { className: 'area--rules formattxt-charlog', noInteraction: true })),
		])));
	}
}

export default RulesArea;
