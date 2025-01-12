import { Context, Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import { Model, ModelWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
import Fader from 'components/Fader';
import Collapser from 'components/Collapser';
import objectDefault from 'utils/objectDefault';
import formatDateTime from 'utils/formatDateTime';
import CharSettingsBotTokenContent from './CharSettingsBotTokenContent';

const txtNotIssued = l10n.l('charSettingsBotToken.notIssue', "No token issued");

class CharSettingsBotTokenComponent {
	constructor(module, char, charSettings, state) {
		this.module = module;
		this.char = char;
		this.charSettings = charSettings;
		this.state = objectDefault(state, {
			open: false,
		});
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });
	}

	render(el) {
		let components = {};
		let contentCollapser = new Collapser();
		this.elem = new Context(
			() => {
				let ctx = { model: new ModelWrapper(null, { eventBus: this.module.self.app.eventBus }) };
				this.module.auth.getUserPromise()
					.then(user => this.module.api.get('auth.user.' + user.id + '.bots'))
					.then(bots => {
						if (ctx.model) {
							ctx.model.setModel(bots);
						}
					});
				return ctx;
			},
			ctx => {
				ctx.model.dispose();
				ctx.model = null;
			},
			ctx => new PanelSection(
				l10n.l('charSettingsBotToken.botToken', "Bot token"),
				new ModelComponent(
					ctx.model,
					new ModelComponent(
						null,
						new Elem(n => n.elem('div', { className: 'charsettingsbottoken badge', events: {
							click: (e, ev) => {
								if (ctx.model && ctx.model.props[this.char.id]) {
									this._toggleContent();
									ev.stopPropagation();
								}
							},
						}}, [
							n.elem('div', { className: 'badge--select' }, [
								n.elem('button', {
									className: 'badge--faicon iconbtn smallicon solid',
									events: {
										click: (c, e) => {
											this._renewToken(ctx.model);
											e.stopPropagation();
										},
									},
								}, [
									n.component(new FAIcon('key')),
								]),
								n.elem('div', { className: 'badge--info' }, [
									n.elem('div', { className: 'badge--subtitle' }, [
										n.component(new Txt(l10n.l('charSettingsBotToken.issued', "Issued"))),
									]),
									n.component('issued', new Fader("", { className: 'badge--text' })),
								]),
							]),
							n.component(new ModelComponent(
								this.model,
								contentCollapser,
								(m, c) => this._setContent(c, ctx, m, components),
							)),
						])),
						(m, c) => {
							let n = c.getNode('issued');
							let issued = m && m.issued;
							n.setComponent(issued
								? components.issued = (components.issued && components.issued.getModel() == m
									? components.issued
									: new ModelTxt(m, m => formatDateTime(new Date(m.issued), { showYear: true }), { className: 'charsettingsbottoken--issued' })
								)
								: components.notIssued = components.notIssued || new Txt(txtNotIssued, { className: 'charsettingsbottoken--notissued' }),
							);
						},
					),
					(m, c) => {
						let bot = (m && m.props[this.char.id]) || null;
						// Ensure we close the content
						if (!bot) {
							this._toggleContent(false);
						}
						c.getComponent()[bot ? 'addClass' : 'removeClass']('btn');
						this._setContent(contentCollapser, ctx, this.model, components);
						c.setModel(bot);
					},
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('charSettingsBotToken.botTokenInfo', "The token is used as credentials when accessing the API to control the character using a bot script.\nCreate or renew the token by clicking the key-icon."),
					popupTipClassName: 'popuptip--width-s',
				},
			),
		);
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			Object.assign(this.state, this.model.props);
		}
	}

	_setContent(c, ctx, model, components) {
		let bot = ctx.model && ctx.model.props[this.char.id];
		c.setComponent(components.content = model.open && bot
			? components.content || new CharSettingsBotTokenContent(this.module, this.char, bot)
			: null,
		);
	}

	_toggleContent(open) {
		this.model.set({ open: typeof open == 'undefined'
			? !this.model.open
			: !!open,
		});
	}

	_renewToken(bots) {
		let bot = bots.props[this.char.id];
		this.module.confirm.open(() => this._issueToken(bots), {
			title: bot
				? l10n.l('charSettingsBotToken.confirmRenewToken', "Confirm renew token")
				: l10n.l('charSettingsBotToken.confirmTokenCreate', "Confirm create token"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(bot
					? l10n.l('charSettingsBotToken.renewTokenBody', "Do you really wish to renew the bot token?")
					: l10n.l('charSettingsBotToken.createTokenBody', "Do you really wish to create a bot token?"), { tagName: 'p' },
				)),
				n.elem('p', [ n.component(new ModelTxt(this.char, m => (m.name + " " + m.surname).trim(), { className: 'dialog--strong' })) ]),
				n.elem('p', { className: 'dialog--error' }, [
					n.component(new FAIcon('exclamation-triangle')),
					n.html("&nbsp;&nbsp;"),
					n.component(new Txt(bot
						? l10n.l('charSettingsBotToken.renewTokenWarning', "Renewal will disconnect any bot scripts using the previous token.")
						: l10n.l('charSettingsBotToken.createTokenWarning', "Never share a token with anyone, as it can be used to access your character."),
					)),
				]),
			])),
			confirm: bot
				? l10n.l('charSettingsBotToken.renewToken', "Renew token")
				: l10n.l('charSettingsBotToken.createToken', "Create token"),
		});
	}

	_issueToken(bots) {
		let bot = bots.props[this.char.id];
		return (bot ? bot.call('renewToken') : bots.getModel().call('create', { charId: this.char.id }))
			.then(() => {
				this._toggleContent(true);
				this.module.toaster.open({
					title: l10n.l('charSettingsBotToken.tokenIssued', "Token issued"),
					content: close => new Elem(n => n.elem('div', [
						n.component(new Txt(l10n.l('charSettingsBotToken.botTokenIssued', "Bot token issued"), { tagName: 'p' })),
						n.elem('div', { className: 'common--sectionpadding' }, [
							n.component(new Txt((this.char.name + ' ' + this.char.surname).trim(), { tagName: 'div', className: 'dialog--strong' })),
						]),
					])),
					closeOn: 'click',
					type: 'success',
					autoclose: true,
				});
			})
			.catch(err => this.module.toaster.openError(err, { title: l10n.l('charSettingsBotToken.failedToIssueToken', "Failed to issue token") }));
	}
}

export default CharSettingsBotTokenComponent;
