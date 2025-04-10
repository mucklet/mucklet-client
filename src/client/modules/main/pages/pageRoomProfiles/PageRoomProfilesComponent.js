import { Elem, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent, ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import PageRoomProfilesProfile from './PageRoomProfilesProfile';

class PageRoomProfilesComponent {
	constructor(module, profiles, ctrl, room, state, close) {
		this.module = module;
		this.profiles = profiles;
		this.ctrl = ctrl;
		this.room = room;
		state.profileId = state.profileId || null;
		this.state = state;
		this.close = close;
		this.model = null;

		// Bind callbacks
		this._onCreate = this._onCreate.bind(this);
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });
		let createProfile = new Elem(n => n.elem('div', { className: 'common--addpadding' }, [
			n.elem('button', { events: { click: this._onCreate }, className: 'btn icon-left common--addbtn' }, [
				n.component(new FAIcon('plus')),
				n.component(new Txt(l10n.l('pageRoomProfiles.createProfile', "Create new profile"))),
			]),
		]));
		this.elem = new Elem(n => n.elem('div', { className: 'pageroomprofiles' }, [
			n.component(new ModelTxt(this.room, m => m.name, { tagName: 'div', className: 'common--itemtitle common--sectionpadding' })),
			n.component(new CollectionList(
				this.profiles,
				profile => new PageRoomProfilesProfile(this.module, this.ctrl, this.room, profile, this.model, this.close),
				{ className: 'pageroomprofiles--profiles' },
			)),
			n.component(new CollectionComponent(
				this.ctrl.profiles,
				new Collapser(),
				(col, c, ev) => c.setComponent(col.length
					? null
					: new Txt(l10n.l('pageRoomProfiles.noProfiles', "There are no stored profiles"), { className: 'common--nolistplaceholder' }),
				),
			)),
			n.component(new ModelComponent(
				this.ctrl,
				new Collapser(),
				(m, c) => c.setComponent(m.puppeteer ? null : createProfile),
			)),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, this.model.props);
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onCreate() {
		this.module.createLimits.validateRoomProfiles(this.profiles, () => this.module.dialogCreateRoomProfile.open(this.ctrl));
	}
}

export default PageRoomProfilesComponent;
