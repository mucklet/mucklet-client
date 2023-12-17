import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import IDStep from 'classes/IDStep';
import DelimStep from 'classes/DelimStep';
import objectSetList from 'utils/objectSetList';

const usageText = 'undelete area <span class="param">#AreaID</span> <span class="opt">= <span class="param">Owner</span></span>';
const shortDesc = 'Undelete an area';
const helpText =
`<p>Undelete a previously deleted area, together any parent area the area belonged to.</p>
<code class="param">#AreaID</code> is the ID of the area to undelete.</p>
<code class="param">Owner</code> is the name of a character to set as new owner. Defaults to previous owner if omitted.</p>`;

/**
 * UndeleteArea adds command to undelete a character area.
 */
class UndeleteArea {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdSteps',
			'charLog',
			'helpBuilder',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('undelete', {
			key: 'area',
			next: [
				new IDStep('areaId', {
					name: "area ID",
				}),
				new DelimStep("=", {
					errRequired: null,
					next: [
						this.module.cmdSteps.newAnyCharStep({
							errRequired: step => new Err('undeleteArea.newOwnerRequired', "Who do you want to set as new owner?"),
							sortOrder: [ 'room', 'awake', 'watch' ],
						}),
					],
				}),
			],
			value: (ctx, p) => this.undeleteArea(ctx.char, p),
		});

		this.module.helpBuilder.addTopic({
			id: 'undeleteArea',
			cmd: 'undelete area',
			usage: l10n.l('undeleteArea.usage', usageText),
			shortDesc: l10n.l('undeleteArea.shortDesc', shortDesc),
			desc: l10n.l('undeleteArea.helpText', helpText),
			sortOrder: 1330,
		});
	}

	undeleteArea(ctrl, params) {
		return this.module.player.getPlayer().call('undeleteArea', {
			areaId: params.areaId,
			ownerId: params.charId || undefined,
		}).then(undeleted => {
			let html = objectSetList(undeleted);
			this.module.charLog.logComponent(ctrl, 'undeleteArea', new Elem(n => n.elem('div', {
				className: 'charlog--pad',
			}, [
				n.component(new Txt(l10n.t('undeleteArea.undeleted', "Undeleted"), { tagName: 'h4', className: 'charlog--pad' })),
				n.component(new Html(html, { className: 'charlog--code' })),
			])));
		});
	}
}

export default UndeleteArea;
