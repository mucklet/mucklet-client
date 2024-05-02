import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';

const usageText = 'stop focus <span class="param">Character</span>';
const shortDesc = 'Remove focus from a character';
const helpText =
`<p>Remove focus from a character, previously focused on using <code>focus</code>.</p>
<p><code class="param">Character</code> is the name of the character to remove focus from, or <code>@all</code> to remove a focus on all events.</p>
<p>Alias: <code>unfocus</code>`;

/**
 * StopFocus adds the stop focus command.
 */
class StopFocus {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'charLog', 'charFocus', 'help', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		let opts = {
			next: [
				new ListStep('charId', this.module.charFocus.getFocusCharList(), {
					name: "character being focused on",
					else: [
						new DelimStep('@', {
							errRequired: step => new Err('stopFocus.characterRequired', "Who do you want to remove focus from?"),
							next: [
								new ListStep('at', new ItemList({
									items: [{ key: 'all' }],
								}), {
									name: "stopFocus at",
									errNotFound: step => new Err('focus.atNotFound', "Did you mean to stop focus @all?"),
									errRequired: step => new Err('focus.atRequired', "Did you mean to stop focus @all?"),
								}),
							],
						}),
					],
				}),
			],
			value: (ctx, p) => this.stopFocus(ctx.player, ctx.char, p),
		};

		this.module.cmd.addPrefixCmd('stop', Object.assign({ key: 'focus' }, opts));
		this.module.cmd.addCmd(Object.assign({ key: 'unfocus' }, opts));

		this.module.help.addTopic({
			id: 'stopFocus',
			category: 'friends',
			cmd: 'stop focus',
			alias: [ 'unfocus' ],
			usage: l10n.l('stopFocus.usage', usageText),
			shortDesc: l10n.l('stopFocus.shortDesc', shortDesc),
			desc: l10n.l('stopFocus.helpText', helpText),
			sortOrder: 40,
		});
	}

	stopFocus(player, char, params) {
		return params.at == 'all'
			? this.module.charFocus.toggleNotifyOnAll(char, false, true)
				.then((change) => {
					if (!change) {
						throw new Err('focus.alreadyNotNotifyOnAll', "{charName} is already not being notified on all events.", { charName: char.name });
					}
					this.module.charLog.logInfo(char, l10n.l('focus.stopNotifyOnAll', "Removed notifications on all events."));
				})
			: Promise.resolve(this.module.charFocus.removeFocus(char, params.charId))
				.then(result => {
					this.module.charLog.logInfo(char, l10n.l('stopFocus.stopFocusingOnChar', "Removed focus from {charName}.", { charName: result.char.name }));
				});
	}
}

export default StopFocus;
