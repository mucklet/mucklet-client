import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import copyToClipboard from 'utils/copyToClipboard';

class PlayerSettingsManagerTokenContent {
	constructor(module, user, token) {
		this.module = module;
		this.user = user;
		this.token = token;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'playersettingsmanagertoken-content' }, [
			n.elem('div', { className: 'badge--select badge--margin' }, [
				n.elem('div', { className: 'flex-row' }, [
					n.component(new Txt(l10n.l('playerSettingsManagerToken.token', "Token"), { className: 'badge--iconcol badge--subtitle badge--micro' })),
					n.component(new ModelTxt(this.token, m => m.secret.slice(0, 20) + "...", {
						className: 'badge--info badge--text badge--nowrap playersettingsmanagertoken-content--token',
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
					n.component(new Txt(l10n.l('playerSettingsManagerToken.copy', "Copy to clipboard"))),
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
		copyToClipboard(this.token.secret).then(() => this.module.toaster.open({
			title: l10n.l('playerSettingsManagerToken.copiedToClipboard', "Copied to clipboard"),
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('playerSettingsManagerToken.copiedToken', "Copied manager token to clipboard."), { tagName: 'p' })),
			])),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		})).catch(err => this.module.toaster.openError(err, {
			title: l10n.l('playerSettingsManagerToken.failedToCopyToClipboard', "Failed to copy to clipboard"),
		}));
	}

	_deleteToken() {
		this.module.confirm.open(() => this.token.call('delete')
			.catch(err => this.module.toaster.openError(err, { title: l10n.l('playerSettingsManagerToken.failedToDeleteToken', "Failed to delete token") })),
		{
			title: l10n.l('playerSettingsManagerToken.confirmDeleteToken', "Confirm delete token"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('playerSettingsManagerToken.deleteTokenBody', "Do you really wish to delete the manager token?"), { tagName: 'p' },
				)),
				n.elem('p', { className: 'dialog--error' }, [
					n.component(new FAIcon('exclamation-triangle')),
					n.html("&nbsp;&nbsp;"),
					n.component(new Txt(l10n.l('playerSettingsManagerToken.deleteTokenWarning', "Deletion will disconnect any tool using the token."))),
				]),
			])),
			confirm: l10n.l('playerSettingsManagerToken.delete', "Delete"),
		});
	}

}

export default PlayerSettingsManagerTokenContent;
