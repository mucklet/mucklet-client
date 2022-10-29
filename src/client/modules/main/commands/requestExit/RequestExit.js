import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import IDStep from 'classes/IDStep';
import prepareKeys from 'utils/prepareKeys';

const usageText = 'request exit <span class="param">Name</span> = <span class="param">#RoomID</span>';
const shortDesc = "Request to create an exit to someone else's room";
const helpText =
`<p>Request to create a new exit from current room to a room owned by another player's character.</p>
<p><code class="param">Name</code> is the exit name and keyword used with the <code>go</code> command.</p>
<p><code class="param">#RoomID</code> is the destination room.</p>
<p>A room's ID can be obtained using the <code>get room id</code> command.</p>`;

/**
 * RequestExit adds command to request a new room exit with the target room
 * being owned by another player's character.
 */
class RequestExit {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'help' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.cmd.addPrefixCmd('request', {
			key: 'exit',
			next: [
				new TextStep('name', {
					regex: /^[^=]*[^=\s]/,
				}),
				new DelimStep("=", {
					next: new IDStep('targetRoom', {
						name: "target room ID"
					})
				})
			],
			value: (ctx, p) => this.requestExit(ctx.char, {
				name: p.name.trim(),
				keys: prepareKeys(p.name),
				targetRoom: p.targetRoom
			})
		});

		this.module.help.addTopic({
			id: 'requestExit',
			category: 'request',
			cmd: 'request exit',
			usage: l10n.l('requestExit.usage', usageText),
			shortDesc: l10n.l('requestExit.shortDesc', shortDesc),
			desc: l10n.l('requestExit.helpText', helpText),
			sortOrder: 10,
		});
	}

	requestExit(char, params) {
		return char.call('requestCreateExit', params).then(result => {
			this.module.charLog.logInfo(char, l10n.l('requestExit.exitRequested', "Requested to create exit \"{exitName}\" to \"{targetRoomName}\".", { exitName: result.exit.name, targetRoomName: result.targetRoom.name }));
		});
	}
}

export default RequestExit;
