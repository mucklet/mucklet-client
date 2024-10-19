import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import DelimStep from 'classes/DelimStep';
import ListStep from 'classes/ListStep';
import ItemList from 'classes/ItemList';
import Err from 'classes/Err';

const usageText = 'wipe char <span class="param">Character</span> : <span class="param">Attribute</span>';
const shortDesc = 'Wipe an image or avatar from a character';
const helpText =
`<p>Wipe the currently used image or avatar from a character.</p>
<p>A moderator action will be added to an existing report. If a report doesn't exist for the character, one will be created and assigned to you.</p>
<p><code class="param">Character</code> is the name of the character to wipe from.</p>
<p><code class="param">Attribute</code> is the attribute to wipe. May be <code>image</code> or <code>avatar</code>.</p>`;

const attrOpt = {
	image: {
		method: 'wipeCharImage',
		confirm: l10n.l('wipeChar.wipeCharImageBody', "Do you really wish to wipe the current image of the character?"),
		success: l10n.l('wipeChar.successfullyWipedImage', "Successfully wiped image from {charName}."),
	},
	avatar: {
		method: 'wipeCharAvatar',
		confirm: l10n.l('wipeChar.wipeCharAvatarBody', "Do you really wish to wipe the current avatar of the character?"),
		success: l10n.l('wipeChar.successfullyWipedAvatar', "Successfully wiped avatar from {charName}."),
	},
};

/**
 * WipeChar adds command to wipe character attributes.
 */
class WipeChar {
	constructor(app) {
		this.app = app;

		this.app.require([
			'cmd',
			'cmdSteps',
			'charLog',
			'info',
			'helpModerate',
			'confirm',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.helpTopic = null;

		this.module.cmd.addPrefixCmd('wipe', {
			key: 'char',
			next: [
				this.module.cmdSteps.newAnyCharStep({
					errRequired: step => new Err('transferChar.characterRequired', "What character do you wish to wipe images from?"),
					sortOrder: [ 'awake', 'watch', 'room' ],
				}),
				new DelimStep(":", { errRequired: null }),
				new ListStep('attr', new ItemList({
					items: [
						{ key: 'image' },
						{ key: 'avatar' },
					],
				}), {
					name: "character attribute",
					token: 'attr',
				}),
			],
			value: (ctx, p) => this.wipeCharAttribute(ctx.player, ctx.char, p),
		});

		this.module.helpModerate.addTopic({
			id: 'wipeChar',
			cmd: 'wipe char',
			usage: l10n.l('wipeChar.usage', usageText),
			shortDesc: l10n.l('wipeChar.shortDesc', shortDesc),
			desc: l10n.t('wipeChar.helpText', helpText),
			sortOrder: 230,
		});
	}

	/**
	 * Wipes an image or avatar from a character.
	 * @param {Model} player Player model
	 * @param {Model} ctrl Controlled character model
	 * @param {object} params Params
	 * @param {string} [params.charId] ID of character to wipe from.
	 * @param {string} [params.charName] Name of character to wipe from. Ignored if charId is set.
	 * @param {string} [params.attr] Attribute to wipe. Either "image" or "avatar".
	 * @returns Promise
	 */
	wipeCharAttribute(player, ctrl, params) {
		let o = attrOpt[params.attr];
		if (!o) {
			throw ("Invalid attribute: " + params.attr);
		}

		return player.call('getChar', params.charId
			? { charId: params.charId }
			: { charName: params.charName },
		).then(char => {
			this.module.confirm.open(() => player.call(o.method, { charId: char.id }).then(() => {
				this.module.charLog.logInfo(ctrl, l10n.l(o.success, { charName: (char.name + " " + char.surname).trim() }));
			}), {
				title: l10n.l('wipeChar.confirmWipe', "Confirm wipe"),
				body: new Elem(n => n.elem('div', [
					n.component(new Txt(o.confirm, { tagName: 'p' })),
					n.elem('p', [ n.component(new ModelTxt(char, m => (m.name + " " + m.surname).trim(), { className: 'dialog--strong' })) ]),
					n.elem('p', { className: 'dialog--error' }, [
						n.component(new FAIcon('exclamation-triangle')),
						n.html("&nbsp;&nbsp;"),
						n.component(new Txt(l10n.l('wipeChar.wipeWarning', "A wipe cannot be undone."))),
					]),
				])),
				confirm: l10n.l('wipeChar.delete', "Wipe"),
			});
		});
	}
}

export default WipeChar;
