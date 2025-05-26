import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import IDStep from 'classes/IDStep';
import DelimStep from 'classes/DelimStep';
import Err from 'classes/Err';
import objectSetList from 'utils/objectSetList';

const usageText = 'undelete room <span class="param">#RoomID</span> <span class="opt">= <span class="param">Owner</span></span>';
const shortDesc = 'Undelete a room';
const helpText =
`<p>Undelete a previously deleted room, together with any area and parent area the room belonged to.</p>
<code class="param">#RoomID</code> is the ID of the room to undelete.</p>
<code class="param">Owner</code> is the name of a character to set as new owner. Defaults to previous owner if omitted.</p>`;

/**
 * UndeleteRoom adds command to undelete a character room.
 */
class UndeleteRoom {
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
			key: 'room',
			next: [
				new IDStep('roomId', {
					name: "room ID",
				}),
				new DelimStep("=", {
					errRequired: null,
					next: [
						this.module.cmdSteps.newAnyCharStep({
							errRequired: step => new Err('undeleteRoom.newOwnerRequired', "Who do you want to set as new owner?"),
							sortOrder: [ 'room', 'awake', 'watch' ],
						}),
					],
				}),
			],
			value: (ctx, p) => this.undeleteRoom(ctx.char, p),
		});

		this.module.helpBuilder.addTopic({
			id: 'undeleteRoom',
			cmd: 'undelete room',
			usage: l10n.l('undeleteRoom.usage', usageText),
			shortDesc: l10n.l('undeleteRoom.shortDesc', shortDesc),
			desc: l10n.l('undeleteRoom.helpText', helpText),
			sortOrder: 1320,
		});
	}

	undeleteRoom(ctrl, params) {
		return this.module.player.getPlayer().call('undeleteRoom', {
			roomId: params.roomId,
			ownerId: params.charId || undefined,
		}).then(undeleted => {
			let html = objectSetList(undeleted);
			this.module.charLog.logComponent(ctrl, 'undeleteRoom', new Elem(n => n.elem('div', {
				className: 'charlog--pad',
			}, [
				n.component(new Txt(l10n.t('undeleteRoom.undeleted', "Undeleted"), { tagName: 'h4', className: 'charlog--pad' })),
				n.component(new Html(html, { className: 'charlog--code' })),
			])));
		});
	}
}

export default UndeleteRoom;
