import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import ListStep from 'classes/ListStep';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import CharTagsList, { hasTags } from 'components/CharTagsList';
import idleLevels from 'utils/idleLevels';
import formatDateTime from 'utils/formatDateTime';

const usageText = 'whois <span class="param">Character</span>';
const shortDesc = "Show character information";
const helpText =
`<p>Show information about any character.</p>
<p><code class="param">Character</code> is the name of the character to show information about.</p>
<p>Alias: <code>wi</code></p>`;

const textNotSet = l10n.l('whois.unknownGenderAndSpecies', "Unknown gender and species");

/**
 * Whois adds the whois command.
 */
class Whois {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'help', 'charLog', 'player', 'avatar' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.module.cmd.addCmd({
			key: 'whois',
			next: new ListStep('charId', this.module.cmdLists.getAllChars(), {
				textId: 'charName',
				name: "character",
				errRequired: step => ({ code: 'whoisCmd.characterRequired', message: "Who do you want to show information about?" })
			}),
			alias: [ 'wi' ],
			value: (ctx, p) => this.whois(ctx.char, p)
		});

		this.module.help.addTopic({
			id: 'whois',
			category: 'basic',
			cmd: 'whois',
			alias: [ 'wi' ],
			usage: l10n.l('addTag.usage', usageText),
			shortDesc: l10n.l('addTag.shortDesc', shortDesc),
			desc: l10n.l('addTag.helpText', helpText),
			sortOrder: 30,
		});
	}

	whois(char, params) {
		return this.module.player.getPlayer().call('getChar', params.charId ? { charId: params.charId } : { charName: params.charName })
			.then(c => {
				let charName = (c.name + ' ' + c.surname).trim();
				let genderSpecies = (firstLetterUppercase(c.gender) + ' ' + firstLetterUppercase(c.species)).trim();
				this.module.charLog.logComponent(char, 'whois', new Elem(n => n.elem('div', { className: 'whois charlog--pad' }, [
					n.elem('div', { className: 'badge large charlog--badge charlog--pad' }, [
						n.elem('div', { className: 'badge--select' }, [
							n.component(this.module.avatar.newAvatar(c, { className: 'badge--icon' })),
							n.elem('div', { className: 'badge--info large' }, [
								n.elem('div', { className: 'badge--title badge--nowrap' }, [
									n.component(new Txt(charName))
								]),
								n.elem('div', { className: (genderSpecies ? 'badge--strong' : 'badge--text common--placeholder') + ' badge--nowrap' }, [
									n.component(new Txt(genderSpecies || textNotSet))
								]),
								n.elem('div', { className: 'badge--text badge--nowrap' + (c.lastAwake
									? c.awake
										? (' ' + idleLevels[c.idle].className)
										: ''
									: ' common--placeholder'
								) }, [
									n.component(new Txt(
										c.awake
											? idleLevels[c.idle].text
											: c.lastAwake
												? l10n.l('whois.lastSeen', "Last seen {time}", { time: formatDateTime(new Date(c.lastAwake)) })
												: l10n.l('whois.neverSeen', "Never seen")
									)),
									n.component(c.status ? new Txt(' (' + c.status + ')') : null)
								])
							])
						]),
						n.component(hasTags(c.tags)
							? new Elem(n => n.elem('div', { className: 'badge--select badge--margin' }, [
								n.component(new CharTagsList(c.tags, { eventBus: this.app.eventBus, static: true }))
							]))
							: null
						)
					]),
				])));
			});
	}
}

export default Whois;
