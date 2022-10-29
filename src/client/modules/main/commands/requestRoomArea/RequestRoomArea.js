import l10n from 'modapp-l10n';
import IDStep from 'classes/IDStep';
import DelimStep from 'classes/DelimStep';

const usageText = 'request room area = <span class="param">#AreaID</span>';
const shortDesc = "Request to set the room area to an area owned by someone else's character";
const helpText =
`<p>Request to set the room area to an area owned by someone else's character.</p>
<p><code class="param">#AreaID</code> is the ID of the area to set for the room.</p>`;

/**
 * RequestRoomArea adds command to request to changed room area to an area owned
 * by another player.
 */
class RequestRoomArea {
	constructor(app) {
		this.app = app;

		this.app.require([ 'requestRoom', 'cmdLists', 'charLog', 'help', 'player' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.requestRoom.getRoomAttr().addItem({
			key: 'area',
			next: [
				new DelimStep("=", { errRequired: null }),
				new IDStep('areaId', {
					name: "area ID",
					list: () => {
						let c = module.player.getActiveChar();
						return ((c && c.ownedAreas && c.ownedAreas.toArray()) || []).map(v => v.id);
					}
				})
			],
			value: (ctx, p) => this.requestRoomArea(ctx.char, Object.assign({ roomId: ctx.char.inRoom.id, areaId: p.areaId }))
		});

		this.module.help.addTopic({
			id: 'requestRoomArea',
			category: 'request',
			cmd: 'request room area',
			usage: l10n.l('requestRoomArea.usage', usageText),
			shortDesc: l10n.l('requestRoomArea.shortDesc', shortDesc),
			desc: l10n.l('requestRoomArea.helpText', helpText),
			sortOrder: 120,
		});
	}

	requestRoomArea(char, params) {
		return char.call('requestSetRoom', params).then(() => {
			this.module.charLog.logInfo(char, l10n.l('requestAreaParent.areaParentRequested', "Requested to set room area."));
		});
	}
}

export default RequestRoomArea;
