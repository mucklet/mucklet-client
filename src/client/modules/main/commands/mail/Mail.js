import { Elem, Txt } from 'modapp-base-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import TextStep from 'classes/TextStep';
import DelimStep from 'classes/DelimStep';
import MultiDelimStep from 'classes/MultiDelimStep';
import ValueStep from 'classes/ValueStep';
import { communicationTooLong } from 'utils/cmdErr';

const usageText = 'mail <span class="param">Character</span> =<span class="opt">&gt;</span><span class="opt">:</span> <span class="param">Message</span>';
const shortDesc = 'Send a mail message to a character, awake or asleep';
const helpText =
`<p>Send a mail message to a character, awake or asleep. Mail can be read by the character's player even when the character is asleep.<br>
If the message starts with <code>&gt;</code> (greater than), the message will be marked as out of character (OOC).<br>
If the message starts with <code>:</code> (colon), the message will be treated in the same way as a <code>pose</code> action rather than something being texted.</p>
<p><code class="param">Character</code> is the name of the character to send a mail to.</p>
<p><code class="param">Message</code> is the mail message. It may be formatted and span multiple paragraphs.</p>`;

/**
 * Mail adds the message command.
 */
class Mail {
	constructor(app) {
		this.app = app;

		this.app.require([ 'cmd', 'cmdLists', 'cmdSteps', 'help', 'api', 'charLog', 'confirm', 'info' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
		this.lastCharId = {};

		this.module.cmd.addCmd({
			key: 'mail',
			next: [
				this.module.cmdSteps.newAnyCharStep({
					errRequired: step => ({ code: 'mail.characterRequired', message: "Who do you want to send a mail to?" }),
				}),
				new DelimStep("=", {
					next: [
						new MultiDelimStep({
							">": { next: new ValueStep('ooc', true), errRequired: null },
							":": { next: new ValueStep('pose', true), errRequired: null },
						}),
						new TextStep('msg', {
							spanLines: true,
							token: state => state.getParam('ooc') ? 'ooc' : 'text',
							maxLength: () => this.module.info.getMail().mailMaxLength,
							errTooLong: communicationTooLong,
							errRequired: step => ({ code: 'mail.messageRequired', message: "What is the message you want to mail?" }),
							completer: this.module.cmdLists.getCharsAwake(),
							formatText: true,
						}),
					],
				}),
			],
			value: (ctx, p) => this.mail(ctx.player, ctx.char, p),
		});

		this.module.help.addTopic({
			id: 'mail',
			category: 'communicate',
			cmd: 'mail',
			usage: l10n.l('mail.usage', usageText),
			shortDesc: l10n.l('mail.shortDesc', shortDesc),
			desc: l10n.l('mail.helpText', helpText),
			sortOrder: 80,
		});
	}

	mail(player, char, params) {
		return (params.charId
			? Promise.resolve({ id: params.charId })
			: player.call('getChar', { charName: params.charName })
		).then(c => {
			let o = {
				toCharId: c.id,
				fromCharId: char.id,
				text: params.msg,
				pose: params.pose,
				ooc: params.ooc,
			};
			return this.module.api.call('mail.player.' + player.id + '.inbox', 'send', o).catch(err => {
				if (err.code != 'mail.toCharIsPuppet') {
					return err;
				}

				// Show confirm window for mailing puppets
				o.sendToPuppet = true;
				this.module.confirm.open(() => this.module.api.call('mail.player.' + player.id + '.inbox', 'send', o).catch(err => {
					this.module.charLog.logError(char, err);
				}), {
					title: l10n.l('mail.sendToPuppet', "Send mail to puppet"),
					body: new Elem(n => n.elem('div', [
						n.component(new Txt(l10n.l('mail.mailPuppetBody', "Do you really wish to mail a puppet?"), { tagName: 'p' })),
						n.elem('p', { className: 'dialog--strong' }, [
							n.component(new FAIcon('info-circle')),
							n.html("&nbsp;&nbsp;"),
							n.component(new Txt(l10n.l('mail.mailPuppetWarning', "The mail will be sent to the puppet's owner, not the controlling puppeteer."))),
						]),
					])),
					confirm: l10n.l('mail.sendMail', "Send mail"),
				});
			});
		});
	}
}

export default Mail;
