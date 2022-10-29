import l10n from 'modapp-l10n';
import TextStep from 'classes/TextStep';
import ListStep from 'classes/ListStep';
import ValueStep from 'classes/ValueStep';
import { communicationTooLong } from 'utils/cmdErr';

/**
 * SetCharAttr adds common character attributes to the set char command.
 */
class SetCharAttr {
	constructor(app) {
		this.app = app;

		this.app.require([ 'set', 'cmdLists', 'charLog' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		let attr = [
			{
				key: 'dnd',
				stepFactory: module => new ListStep('value', this.module.cmdLists.getBool(), { name: "do not disturb flag" }),
				desc: l10n.l('setChar.dnd', "Do not disturb flag, preventing messages to be sent to and from the character. Value is <code>yes</code> or <code>no</code>."),
				sortOrder: 200,
			},
			{
				key: 'dndMsg',
				stepFactory: module => new ValueStep('value', '', {
					next: new TextStep('value', {
						name: "do not disturb message",
						maxLength: () => module.info.getCore().communicationMaxLength,
						errTooLong: communicationTooLong,
						spanLines: true,
						errRequired: null
					}),
				}),
				desc: l10n.l('setChar.dndDesc', "Do not disturb message. It may be formatted and span multiple paragraphs."),
				sortOrder: 210,
			},
		];
		for (let o of attr) {
			this.module.set.addAttribute(Object.assign({
				value: (ctx, p) => this.setCharSettings(ctx, Object.assign({ attr: o.key }, p))
			}, o));
		}
	}

	setCharSettings(ctx, p) {
		let c = ctx.char;
		return ctx.player.call('setCharSettings', { charId: c.id, puppeteerId: c.puppeteer ? c.puppeteer.id : undefined, [p.attr]: p.value }).then(result => {
			this.module.charLog.logInfo(ctx.char, l10n.l('setCharSettings.updatedCharacter', "Character setting was successfully set."));
		});
	}
}

export default SetCharAttr;
