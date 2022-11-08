import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import Collapser from 'components/Collapser';

class PageCharSelectCharContent {
	constructor(module, ctrl, profile, toggle, close) {
		this.module = module;
		this.ctrl = ctrl;
		this.profile = profile;
		this.toggle = toggle;
		this.close = close;
	}

	render(el) {
		let editProfile = new Elem(n => n.elem('div', { className: 'badge--select badge--select-margin' }, [
			n.elem('button', { className: 'iconbtn medium solid smallicon', events: {
				click: (c, ev) => {
					this._updateProfile();
					ev.stopPropagation();
				},
			}}, [
				n.component(new FAIcon('refresh')),
			]),
			n.elem('button', { className: 'iconbtn medium solid smallicon', events: {
				click: (c, ev) => {
					this.module.pageEditCharProfile.open(this.ctrl, this.profile.id);
					ev.stopPropagation();
				},
			}}, [
				n.component(new FAIcon('pencil')),
			]),
		]));
		this.elem = new Elem(n => n.elem('div', [
			n.elem('div', { className: 'badge--select badge--margin badge--select-margin' }, [
				n.elem('button', { className: 'btn medium primary flex-1', events: {
					click: (el, e) => {
						this._useProfile();
						e.stopPropagation();
					},
				}}, [
					n.component(new FAIcon('user')),
					n.component(new Txt(l10n.l('pageCharProfile.apply', "Apply"))),
				]),
				n.component(new ModelComponent(
					this.ctrl,
					new Collapser(null, { horizontal: true }),
					(m, c) => c.setComponent(m.puppeteer ? null : editProfile),
				)),
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

	_updateProfile() {
		this.module.confirm.open(() => this.module.updateProfile.updateProfile(this.ctrl, { profileId: this.profile.id })
			.catch(err => this.module.confirm.openError(err)),
		{
			title: l10n.l('pageCharProfile.confirmProfileUpdate', "Confirm profile update"),
			body: new Elem(n => n.elem('div', [
				n.component(new Txt(l10n.l('pageCharProfile.profileUpdateBody', "Do you really wish to overwrite the profile with the character's current appearance?"), { tagName: 'p' })),
				n.elem('p', [ n.component(new ModelTxt(this.profile, m => m.name, { className: 'dialog--strong' })) ]),
			])),
			confirm: l10n.l('pageCharProfile.update', "Update"),
		});
	}

	_useProfile() {
		this.module.profile.profile(this.ctrl, { profileId: this.profile.id }, true)
			.then(applied => {
				if (applied) {
					this.close();
				}
			})
			.catch(err => this.module.confirm.openError(err));
	}

}

export default PageCharSelectCharContent;
