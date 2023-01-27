import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import copyToClipboard from 'utils/copyToClipboard';

class CharSettingsBotTokenContent {
	constructor(module, char, bot) {
		this.module = module;
		this.char = char;
		this.bot = bot;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'charsettingsbottoken-content' }, [
			n.elem('div', { className: 'badge--select badge--margin' }, [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('charSettingsBotToken.token', "Token"), { className: 'badge--iconcol badge--subtitle badge--micro' })),
					n.component(new ModelTxt(this.bot, m => m.token.slice(0, 20) + "...", {
						className: 'badge--info badge--text badge--nowrap charsettingsbottoken-content--token',
					})),
				]),
			]),
			n.elem('div', { className: 'badge--divider' }),
			n.elem('div', { className: 'flex-row margin4' }, [
				n.elem('button', { className: 'btn icon-left tiny primary flex-1', events: {
					click: (el, e) => {
						this._copyToken();
						e.stopPropagation();
					},
				}}, [
					n.component(new FAIcon('clipboard')),
					n.component(new Txt(l10n.l('charSettingsBotToken.copy', "Copy to clipboard"))),
				]),
				n.elem('button', { className: 'iconbtn tiny solid tinyicon flex-auto', events: {
					click: (el, e) => {
						this._deleteToken();
						e.stopPropagation();
					},
				}}, [
					n.component(new FAIcon('trash')),
				]),
			]),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_copyToken() {
		copyToClipboard(this.bot.token).then(() => this.module.toaster.open({
			title: l10n.l('charSettingsBotToken.copiedToClipboard', "Copied to clipboard"),
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('charSettingsBotToken.copiedTokenOfCharacter', "Copied bot token of character:"), { tagName: 'p' })),
				n.component(new ModelTxt(this.char, m => (m.name + " " + m.surname).trim(), { tagName: 'p', className: 'dialog--strong' })),
			])),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		})).catch(err => this.module.toaster.openError(err, {
			title: l10n.l('charSettingsBotToken.failedToCopyToClipboard', "Failed to copy to clipboard"),
		}));
	}

	_deleteToken() {
		this.module.confirm.open(() => this.bot.call('delete')
			.catch(err => this.module.toaster.openError(err, { title: l10n.l('charSettingsBotToken.failedToDeleteToken', "Failed to delete token") })),
		{
			title: l10n.l('charSettingsBotToken.confirmDeleteToken', "Confirm delete token"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('charSettingsBotToken.deleteTokenBody', "Do you really wish to delete the bot token?"), { tagName: 'p' },
				)),
				n.elem('p', [ n.component(new ModelTxt(this.char, m => (m.name + " " + m.surname).trim(), { className: 'dialog--strong' })) ]),
				n.elem('p', { className: 'dialog--error' }, [
					n.component(new FAIcon('exclamation-triangle')),
					n.html("&nbsp;&nbsp;"),
					n.component(new Txt(l10n.l('charSettingsBotToken.deleteTokenWarning', "Deletion will disconnect any bot scripts using the token."))),
				]),
			])),
			confirm: l10n.l('charSettingsBotToken.delete', "Delete"),
		});
	}

}

export default CharSettingsBotTokenContent;
