import { Elem } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import formatDateTime from 'utils/formatDateTime';
import PageRoomProfileProfileContent from './PageRoomProfileProfileContent';

class PageRoomProfileProfile {
	constructor(module, ctrl, room, profile, model, close) {
		this.ctrl = ctrl;
		this.room = room;
		this.profile = profile;
		this.module = module;
		this.model = model;
		this.close = close;
	}

	render(el) {
		this.elem = new ModelComponent(
			this.model,
			new Elem(n =>
				n.elem('div', { className: 'pageroomprofile-profile' }, [
					n.elem('btn', 'div', { className: 'badge btn large', events: {
						click: () => this._toggleActions(),
					}}, [
						n.elem('div', { className: 'badge--select' }, [
							n.component(this.module.avatar.newRoomImg(this.profile, { className: 'badge--icon' })),
							n.elem('div', { className: 'badge--info large' }, [
								n.elem('div', { className: 'pageroomprofile-profile--title badge--title badge--nowrap' }, [
									n.component(new ModelTxt(this.profile, p => p.name)),
								]),
								n.elem('div', { className: 'badge--strong badge--nowrap' }, [
									n.component(new ModelTxt(this.profile, p => p.lastUsed
										? l10n.l('pageRoomProfile.lastUsed', "Last used {time}", { time: formatDateTime(new Date(p.lastUsed)) })
										: l10n.l('pageRoomProfile.neverUsed', "Never used"),
									)),
								]),
								n.elem('div', { className: 'badge--text badge--nowrap' }, [
									n.component(new ModelTxt(this.profile, p => p.key)),
								]),
							]),
						]),
						n.component('actions', new Collapser(null)),
					]),
				]),
			),
			(m, c, change) => {
				if (change && !change.hasOwnProperty('profileId')) return;

				c.getNode('actions').setComponent(m.profileId === this.profile.id
					? new PageRoomProfileProfileContent(this.module, this.ctrl, this.room, this.profile, (show) => this._toggleActions(show), this.close)
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
		show = typeof show == 'undefined'
			? !this.model.profileId || this.model.profileId != this.profile.id
			: !!show;

		this.model.set({ profileId: show ? this.profile.id : null });
	}

}

export default PageRoomProfileProfile;
