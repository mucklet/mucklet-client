import l10n from 'modapp-l10n';
import PageEditCharProfileComponent from './PageEditCharProfileComponent';
import './pageEditCharProfile.scss';

/**
 * PageEditCharProfile opens an in-panel edit char profile page in the char panel.
 */
class PageEditCharProfile {
	constructor(app, params) {
		this.app = app;
		this.app.require([
			'api',
			'charPages',
			'dialogCropImage',
			'pageChar',
			'confirm',
			'avatar',
			'deleteProfile',
			'toaster',
			'file',
			'createLimits',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);
	}

	/**
	 * Opens an in-panel edit char page in the char panel.
	 * @param {Model} ctrl Controlled char model.
	 * @param {string} profileId Profile ID of the controlled character.
	 * @returns {Promise.<function>} Promise of a close function.
	 */
	open(ctrl, profileId) {
		return this.module.api.get('core.profile.' + profileId + '.details').then(profile => {
			profile.on();
			return this.module.charPages.openPage(
				ctrl.id,
				ctrl.id,
				(ctrl, char, state, close) => ({
					component: new PageEditCharProfileComponent(this.module, ctrl, profile, state, close),
					title: l10n.l('pageEditCharProfile.editCharProfile', "Edit Character Profile"),
					onClose: () => {
						profile.off();
						close();
					},
				}),
			);
		});
	}
}

export default PageEditCharProfile;
