import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import CharTagsList, { hasTags } from 'components/CharTagsList';

// const usageText = 'tags <span class="param">Character</span>';
// const shortDesc = "List a character's tags";
// const helpText =
// `<p>List a character's tags.</p>
// <p><code class="param">Character</code> is the name of the character to list the tags of.</p>`;

/**
 * TagsCmd adds the tags command.
 */
class TagsCmd {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'charLog', 'api' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'tags',
			next: new ListStep('charId', this.module.cmdLists.getAllChars(), {
				textId: 'charName',
				name: "character",
				errRequired: step => ({ code: 'tagsCmd.characterRequired', message: "Who do you want to list tags for?" }),
			}),
			value: (ctx, p) => this.tags(ctx.player, ctx.char, p),
		});

		// this.module.help.addTopic({
		// 	id: 'tags',
		// 	category: 'tags',
		// 	cmd: 'tags',
		// 	usage: l10n.l('addTag.usage', usageText),
		// 	shortDesc: l10n.l('addTag.shortDesc', shortDesc),
		// 	desc: l10n.l('addTag.helpText', helpText),
		// 	sortOrder: 10,
		// });
	}

	tags(player, char, params) {
		return (params.charId
			? this.module.api.get('core.char.' + params.charId)
			: player.call('getChar', { charName: params.charName })
		).then(c => {
			if (hasTags(c.tags)) {
				this.module.charLog.logComponent(char, 'tags', new Elem(n => n.elem('div', { className: 'tagscmd charlog--pad' }, [
					n.component(new Txt(
						l10n.l('tagsCmd.tagsFor', "Tags for {charName}", { charName: (c.name + ' ' + c.surname).trim() }),
						{ tagName: 'h4', className: 'charlog--pad' },
					)),
					n.component(new CharTagsList(c.tags, { eventBus: this.app.eventBus, static: true })),
				])));
			} else {
				this.module.charLog.logInfo(char, l10n.l('listTags.noTagsSet', "{charName} has no tags set.", { charName: c.name }));
			}
		});
	}
}

export default TagsCmd;
