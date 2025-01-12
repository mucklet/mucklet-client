import { Context, Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt, CollectionComponent } from 'modapp-resource-component';
import { Model, CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
import FAIcon from 'components/FAIcon';
import Fader from 'components/Fader';
import Collapser from 'components/Collapser';
import objectDefault from 'utils/objectDefault';
import formatDateTime from 'utils/formatDateTime';
import PlayerSettingsManagerTokenContent from './PlayerSettingsManagerTokenContent';

const txtNotIssued = l10n.l('playerSettingsManagerToken.notIssue', "No token issued");

class PlayerSettingsManagerTokenComponent {
	constructor(module, user, state) {
		this.module = module;
		this.user = user;
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
				let ctx = { collection: new CollectionWrapper([], { eventBus: this.module.self.app.eventBus }) };
				this.module.api.get('auth.user.' + this.user.id + '.tokens')
					.then(tokens => {
						if (ctx.collection) {
							ctx.collection.setCollection(tokens);
						}
					});
				return ctx;
			},
			ctx => {
				ctx.collection.dispose();
				ctx.collection = null;
			},
			ctx => new PanelSection(
				l10n.l('playerSettingsManagerToken.managerToken', "Manager token"),
				new CollectionComponent(
					ctx.collection,
					new ModelComponent(
						null,
						new Elem(n => n.elem('div', { className: 'playersettingsmanagertoken badge', events: {
							click: (e, ev) => {
								if (ctx.collection?.length) {
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
											let tokens = ctx.collection?._collection; // [TODO] Once the bug is fixed in CollectionWrapper, replace with this: getCollection();
											if (tokens) {
												this._renewToken(tokens);
											}
											e.stopPropagation();
										},
									},
								}, [
									n.component(new FAIcon('key')),
								]),
								n.elem('div', { className: 'badge--info' }, [
									n.elem('div', { className: 'badge--subtitle' }, [
										n.component(new Txt(l10n.l('playerSettingsManagerToken.issued', "Issued"))),
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
									: new ModelTxt(m, m => formatDateTime(new Date(m.issued), { showYear: true }), { className: 'playersettingsmanagertoken--issued' })
								)
								: components.notIssued = components.notIssued || new Txt(txtNotIssued, { className: 'playersettingsmanagertoken--notissued' }),
							);
						},
					),
					(col, c) => {
						let token = col?.length ? col.atIndex(0) : null;
						// Ensure we close the content
						if (!token) {
							this._toggleContent(false);
						}
						c.getComponent()[token ? 'addClass' : 'removeClass']('btn');
						this._setContent(contentCollapser, ctx, this.model, components);
						c.setModel(token);
					},
				),
				{
					className: 'common--sectionpadding',
					noToggle: true,
					popupTip: l10n.l('playerSettingsManagerToken.managerTokenInfo', "The token is used as credentials when accessing the API to manager room scripts and other resources using external tools such as mucklet-script.\nCreate or renew the token by clicking the key-icon."),
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
		let token = ctx.collection?.length && ctx.collection.atIndex(0);
		c.setComponent(components.content = model.open && token
			? components.content || new PlayerSettingsManagerTokenContent(this.module, this.user, token)
			: null,
		);
	}

	_toggleContent(open) {
		this.model.set({ open: typeof open == 'undefined'
			? !this.model.open
			: !!open,
		});
	}

	_renewToken(tokens) {
		let token = tokens.atIndex(0) || null;
		this.module.confirm.open(() => this._issueToken(tokens, token), {
			title: token
				? l10n.l('playerSettingsManagerToken.confirmRenewToken', "Confirm renew token")
				: l10n.l('playerSettingsManagerToken.confirmTokenCreate', "Confirm create token"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(token
					? l10n.l('playerSettingsManagerToken.renewTokenBody', "Do you really wish to renew the manager token?")
					: l10n.l('playerSettingsManagerToken.createTokenBody', "Do you really wish to create a manager token?"), { tagName: 'p' },
				)),
				n.elem('p', { className: 'dialog--error' }, [
					n.component(new FAIcon('exclamation-triangle')),
					n.html("&nbsp;&nbsp;"),
					n.component(new Txt(token
						? l10n.l('playerSettingsManagerToken.renewTokenWarning', "Renewal will disconnect any tool using the previous token.")
						: l10n.l('playerSettingsManagerToken.createTokenWarning', "Never share a token with anyone, as it can be used to access your rooms and scripts."),
					)),
				]),
			])),
			confirm: token
				? l10n.l('playerSettingsManagerToken.renewToken', "Renew token")
				: l10n.l('playerSettingsManagerToken.createToken', "Create token"),
		});
	}

	_issueToken(tokens, token) {
		return (token ? token.call('renewToken') : tokens.call('create'))
			.then(() => {
				this._toggleContent(true);
				this.module.toaster.open({
					title: l10n.l('playerSettingsManagerToken.tokenIssued', "Token issued"),
					content: close => new Elem(n => n.elem('div', [
						n.component(new Txt(l10n.l('playerSettingsManagerToken.managerTokenIssued', "Manager token issued"), { tagName: 'p' })),
					])),
					closeOn: 'click',
					type: 'success',
					autoclose: true,
				});
			})
			.catch(err => this.module.toaster.openError(err, { title: l10n.l('playerSettingsManagerToken.failedToIssueToken', "Failed to issue token") }));
	}
}

export default PlayerSettingsManagerTokenComponent;
