import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import IDStep from 'classes/IDStep';
import DelimStep from 'classes/DelimStep';
import TextStep from 'classes/TextStep';
import RepeatStep from 'classes/RepeatStep';
import objectSetList from 'utils/objectSetList';
import { keyTooLong } from 'utils/cmdErr';

const usageText = 'undelete exit <span class="param">#ExitID</span> <span class="opt">= <span class="param">Owner</span></span>';
const shortDesc = 'Undelete an exit';
const helpText =
`<p>Undelete a previously deleted exit, together with its target room and any area and parent area the room belonged to.</p>
<code class="param">#ExitID</code> is the ID of the exit to undelete.</p>
<code class="param">Owner</code> is the name of a character to set as new owner for any undeleted room or area. Defaults to previous owner if omitted.</p>`;

/**
 * UndeleteExit adds command to undelete a character exit.
 */
class UndeleteExit {
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
			key: 'exit',
			next: [
				new IDStep('exitId', {
					name: "exit ID",
				}),
				new DelimStep(":", {
					errRequired: null,
					next: [
						new RepeatStep(
							'keys',
							(next, idx) => new TextStep('key-' + idx, {
								next,
								regex: /^[\s\w]*\w/,
								name: "exit keyword",
								maxLength: () => module.info.getCore().keyMaxLength,
								errTooLong: keyTooLong,
								completer: module.cmdLists.getInRoomExits(),
							}),
							{
								each: (state, step, idx) => {
									let v = (state.getParam('value') || []).slice(0);
									v.push(state.getParam(step.id));
									state.setParam('value', v);
								},
								delimiter: ",",
							},
						),
					],
				}),
				new DelimStep("=", {
					errRequired: null,
					next: [
						this.module.cmdSteps.newAnyCharStep({
							errRequired: step => new Err('undeleteExit.newOwnerRequired', "Who do you want to set as new owner for any undeleted room?"),
							sortOrder: [ 'exit', 'awake', 'watch' ],
						}),
					],
				}),
			],
			value: (ctx, p) => this.undeleteExit(ctx.char, p),
		});

		this.module.helpBuilder.addTopic({
			id: 'undeleteExit',
			cmd: 'undelete exit',
			usage: l10n.l('undeleteExit.usage', usageText),
			shortDesc: l10n.l('undeleteExit.shortDesc', shortDesc),
			desc: l10n.l('undeleteExit.helpText', helpText),
			sortOrder: 1310,
		});
	}

	undeleteExit(ctrl, params) {
		return this.module.player.getPlayer().call('undeleteExit', {
			exitId: params.exitId,
			keys: params.keys || undefined,
			ownerId: params.charId || undefined,
		}).then(undeleted => {
			let html = objectSetList(undeleted);
			this.module.charLog.logComponent(ctrl, 'undeleteExit', new Elem(n => n.elem('div', {
				className: 'charlog--pad',
			}, [
				n.component(new Txt(l10n.t('undeleteExit.undeleted', "Undeleted"), { tagName: 'h4', className: 'charlog--pad' })),
				n.component(new Html(html, { className: 'charlog--code' })),
			])));
		});
	}
}

export default UndeleteExit;
