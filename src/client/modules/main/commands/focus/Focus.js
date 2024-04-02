import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import DelimStep from 'classes/DelimStep';
import ErrorStep from 'classes/ErrorStep';
import ColorStep from 'classes/ColorStep';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';

const usageText = 'focus <span class="param">Character</span> <span class="opt">= <span class="param">Color<span class="comment">/</span>#Hex</span></span>';
const shortDesc = 'Focus on a character to highlight them';
const helpText =
`<p>Focus on a character to highlight them in the chat log and, if notifications are activated, get notified on their actions.</p>
<p><code class="param">Character</code> is the name of the character to focus on. If the value is <code>@all</code>, notifications will be triggered on all events.</p>
<p><code class="param">Color</code> is an optional color to use for highlighting. May be <code>red</code>, <code>green</code>, <code>blue</code>, <code>yellow</code>, <code>cyan</code>, <code>purple</code>, <code>pink</code>, <code>orange</code>, <code>white</code>, or <code>none</code>.</p>
<p><code class="param">#Hex</code> is an optional HTML hex color code to use for highlighting instead of a preset color.</p>
<p>Use <code>stop focus</code> (alias <code>unfocus</code>) to remove focus from a character.</p>`;
const examples = [
	{ cmd: 'focus Jane Doe', desc: l10n.l('focus.focusNoColorDesc', "Focus on Jane Doe with a random highlight color") },
	{ cmd: 'focus John = green', desc: l10n.l('focus.focusColorDesc', "Focus on John with green hightlight color") },
	{ cmd: 'focus Jane = #c1a657', desc: l10n.l('focus.focusHexDesc', "Focus on Jane with a custom HTML color code") },
	{ cmd: 'focus John = none', desc: l10n.l('focus.focusNoneDesc', "Notifications on events from John without highlighting") },
	{ cmd: 'focus @all', desc: l10n.l('focus.focusAllDesc', "Notifications on all events") },
	{ cmd: 'stop focus John', desc: l10n.l('focus.stopFocusJohnDesc', "Remove focus from John") },
	{ cmd: 'unfocus @all', desc: l10n.l('focus.unfocusJohnDesc', "Remove focus on all event but not individually focused characters") },
];

/**
 * Focus adds the focus command.
 */
class Focus {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdSteps',
			'charLog',
			'charFocus',
			'help',
			'api',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.colors = new ItemList({
			items: Object.keys(this.module.charFocus.getFocusColors()).map(key => ({ key })),
		});

		this.module.cmd.addCmd({
			key: 'focus',
			next: [
				this.module.cmdSteps.newAnyCharStep({
					filterMuted: true,
					sortOrder: [ 'room', 'awake', 'watch' ],
					next: [
						new DelimStep("=", {
							errRequired: null,
							next: new ListStep('color', this.colors, {
								name: "focus color",
								else: new ColorStep('color', {
									errRequired: step => new Err('focus.colorRequired', "What focus color do you want?"),
								}),
							}),
						}),
					],
					else: [
						new DelimStep('@', {
							errRequired: step => new Err('focus.characterRequired', "Who do you want to focus on?"),
							next: [
								new ListStep('at', new ItemList({
									items: [{ key: 'all' }],
								}), {
									name: "focus at",
									errNotFound: step => new Err('focus.atNotFound', "Did you mean to focus @all?"),
									errRequired: step => new Err('focus.atRequired', "Did you mean to focus @all?"),
								}),
								new ErrorStep(/\s*(=)/, new Err('focus.colorNotAllowed', "Highlight colors not avalable for @all.")),
							],
						}),
					],
				}),
			],
			value: (ctx, p) => this.focus(ctx.player, ctx.char, p),
		});

		this.module.help.addTopic({
			id: 'focus',
			category: 'friends',
			cmd: 'focus',
			usage: l10n.l('focus.usage', usageText),
			shortDesc: l10n.l('focus.shortDesc', shortDesc),
			desc: l10n.l('focus.helpText', helpText),
			examples,
			sortOrder: 30,
		});
	}

	focus(player, char, params) {
		return params.at == 'all'
			? this.module.charFocus.toggleFocusAll(char.id, true)
				.then(change => {
					if (change) {
						this.module.charLog.logInfo(char, l10n.l('focus.focusingOnAll', "{charName} focuses on all events.", { charName: char.name }));
					} else {
						this.module.charLog.logError(char, new Err('focus.alreadyFocusOnAll', "{charName} is already focusing on all events.", { charName: char.name }));
					}
				})
			: player.call('getChar', params).then(c => {
				this.module.charFocus.addFocus(char.id, c, params.color);
				this.module.charLog.logInfo(char, l10n.l('focus.focusingOnChar', "Focusing on {targetName}.", { targetName: c.name }));
			});
	}
}

export default Focus;
