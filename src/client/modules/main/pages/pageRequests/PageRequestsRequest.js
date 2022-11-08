import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import formatDateTime from 'utils/formatDateTime';
import errString from 'utils/errString';

const stateIcons = {
	pending: 'question',
	accepted: 'check',
	rejected: 'times',
	failed: 'check',
};

const stateTime = {
	pending: m => l10n.l('pageRequest.expires', "Expires {time}", { time: formatDateTime(new Date(m.expires)) }),
	accepted: m => l10n.l('pageRequest.accepted', "Accepted {time}", { time: formatDateTime(new Date(m.answered)) }),
	rejected: m => l10n.l('pageRequest.rejected', "Rejected {time}", { time: formatDateTime(new Date(m.answered)) }),
	failed: m => l10n.l('pageRequest.failed', "Failed {time}", { time: formatDateTime(new Date(m.answered)) }),
};

class PageRequestsRequest {
	constructor(module, request, model, outgoing) {
		this.module = module;
		this.request = request;
		this.model = model;
		this.outgoing = outgoing;

		this.type = this.module.self.getRequestType(this.request.type) || {};
	}

	get stateProp() {
		return this.outgoing ? 'outgoingRequestId' : 'incomingRequestId';
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new ModelComponent(
				this.request,
				new Elem(n => n.elem('div', { className: 'pagerequests-request' }, [
					n.elem('btn', 'div', { className: 'badge btn margin4', events: {
						click: () => this._toggleActions(),
					}}, [
						n.elem('div', { className: 'badge--select' }, [
							n.elem('icon', 'div', { className: 'pagerequests-request--icon badge--faicon' }, [
								n.component('faicon', new FAIcon()),
							]),
							n.elem('div', { className: 'badge--info' }, [
								n.elem('div', { className: 'badge--title badge--nowrap' }, [
									n.component(new ModelTxt(this.request.from, c => errString(
										c,
										c => (c.name + ' ' + c.surname).trim(),
										l10n.l('pageRequests.unknown', "(Unknown)"),
									))),
								]),
								n.elem('div', { className: 'badge--text badge--nowrap' }, [
									n.component(new ModelTxt(this.request, m => (this.type.titleFactory ? this.type.titleFactory(this.request) : null) || m.type)),
								]),
							]),
						]),
						n.component('actions', new Collapser(null)),
					]),
				])),
				(m, c) => {
					c[m.state == 'pending' ? 'removeNodeClass' : 'addNodeClass']('btn', 'inactive');
					for (let state in stateIcons) {
						c[m.state == state ? 'addNodeClass' : 'removeNodeClass']('icon', state);
					}
					c.getNode('faicon').setIcon(stateIcons[m.state] || 'question');
				},
			),
			(m, c, change) => {
				let prop = this.stateProp;
				if (change && !change.hasOwnProperty(prop)) return;
				c.getComponent().getNode('actions').setComponent(m[prop] === this.request.id
					? new Elem(n => n.elem('div', { className: 'badge--actions' }, [
						n.component(this.type.componentFactory
							? this.type.componentFactory(this.request)
							: null,
						),
						n.elem('div', { className: 'flex-row badge--margin' }, [
							n.component(new Txt(l10n.l('pageRequest.expires', "Time"), { tagName: 'div', className: 'pagerequests-request--expire badge--iconcol badge--subtitle' })),
							n.elem('div', { className: 'badge--info' }, [
								n.component(new ModelTxt(
									this.request,
									m => stateTime[m.state](m),
									{ tagName: 'div', className: 'badge--text' },
								)),
								n.component(new ModelComponent(
									this.request,
									new Collapser(),
									(m, c, change) => {
										if (change && !change.hasOwnProperty('error')) return;
										let err = m.error;
										c.setComponent(err
											? new Txt(l10n.l(err.code, err.message, err.data), { tagName: 'div', className: 'badge--error' })
											: null,
										);
									},
								)),
							]),
						]),
						n.component(new ModelComponent(
							this.request,
							new Collapser(),
							(m, c, change) => {
								if (change && !change.hasOwnProperty('state')) return;

								c.setComponent(m.state == 'pending'
									? this.outgoing
										? new Elem(n => n.elem('div', [
											n.elem('div', { className: 'flex-row margin4 badge--margin' }, [
												n.elem('button', { className: 'btn icon-left medium warning flex-1', events: {
													click: (el, e) => {
														this._revoke();
														e.stopPropagation();
													},
												}}, [
													n.component(new FAIcon('trash')),
													n.component(new Txt(l10n.l('pageRequest.revoke', "Revoke"))),
												]),
											]),
										]))
										: new Elem(n => n.elem('div', [
											n.elem('div', { className: 'flex-row margin4 badge--margin' }, [
												n.elem('button', { className: 'btn icon-left medium primary flex-1', events: {
													click: (el, e) => {
														this._accept();
														e.stopPropagation();
													},
												}}, [
													n.component(new FAIcon('check')),
													n.component(new Txt(l10n.l('pageRequest.reject', "Accept"))),
												]),
												n.elem('button', { className: 'btn icon-left medium warning flex-1', events: {
													click: (el, e) => {
														this._reject();
														e.stopPropagation();
													},
												}}, [
													n.component(new FAIcon('times')),
													n.component(new Txt(l10n.l('pageRequest.reject', "Reject"))),
												]),
											]),
										]))
									: null,
								);
							},
						)),
					]))
					: null,
				);
			},
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_toggleActions(show) {
		let prop = this.stateProp;
		show = typeof show == 'undefined'
			? !this.model[prop] || this.model[prop] != this.request.id
			: !!show;

		this.model.set({ [prop]: show ? this.request.id : null });
	}

	_accept() {
		this.module.player.getPlayer().call('acceptRequest', {
			requestId: this.request.id,
		})
			.then(result => {
				if (result.error) {
					let err = result.error;
					this.module.confirm.open(null, {
						title: l10n.l('pageRequest.error', "Request failed"),
						confirm: l10n.l('confirm.ok', "Okay"),
						body: new Elem(n => n.elem('div', [
							n.component(new Txt(l10n.l('pageRequest.errorBody', "Something went wrong when trying to fulfil the request."), { tagName: 'p' })),
							n.component(new Txt(l10n.l(err.code, err.message, err.data), { tagName: 'i' })),
						])),
						cancel: null,
					});
				}
				this._close();
			})
			.catch(err => this.module.confirm.openError(err));
	}

	_reject() {
		this.module.player.getPlayer().call('rejectRequest', {
			requestId: this.request.id,
		})
			.then(() => this._close())
			.catch(err => this.module.confirm.openError(err));
	}

	_revoke() {
		this.module.confirm.open(() => this.module.player.getPlayer()
			.call('revokeRequest', { requestId: this.request.id })
			.then(() => this._close())
			.catch(err => this.module.confirm.openError(err)),
		{
			title: l10n.l('pageRequests.confirmRevocation', "Confirm revocation"),
			body: l10n.l('pageRequests.revokeBody', "Do you really wish to revoke the request?"),
			confirm: l10n.l('pageRequests.revoke', "Revoke"),
		});
	}

	_close() {
		let prop = this.stateProp;
		if (this.model[prop] == this.request.id) {
			this.model.set({ [prop]: null });
		}
	}

}

export default PageRequestsRequest;
