import { Elem, Txt, Html } from 'modapp-base-component';
import l10n from 'modapp-l10n';

const imageTxt = {
	title: l10n.l('playerEventImageWipe.imageRemoved', "Image removed"),
	default: l10n.l('playerEventImageWipe.imageRemovedInfo', "An image has been removed:"),
	target: {
		char: l10n.l('playerEventImageWipe.charImageRemovedInfo', "An image has been removed from your character:"),
		room: l10n.l('playerEventImageWipe.roomImageRemovedInfo', "An image has been removed from your room:"),
		area: l10n.l('playerEventImageWipe.areaImageRemovedInfo', "An image has been removed from your area:"),
	},
};
const avatarTxt = {
	title: l10n.l('playerEventImageWipe.avatarRemoved', "Avatar removed"),
	default: l10n.l('playerEventImageWipe.avatarRemovedInfo', "An avatar has been removed:"),
	target: {
		char: l10n.l('playerEventImageWipe.charAvatarRemovedInfo', "An avatar has been removed from your character:"),
		// room: l10n.l('playerEventImageWipe.roomAvatarRemovedInfo', "An avatar has been removed from your room:"),
		// area: l10n.l('playerEventImageWipe.areaAvatarRemovedInfo', "An avatar has been removed from your area:"),
	},
};

const moreInfoTxt = l10n.l('playerEventImageWipe.moreInfo', `<div class="pad-bottom-m">If you have questions or objections, get in contact with the moderator team. Type:</div>` +
	`<div class="charlog--code"><code>help helpme</code></div>`);

/**
 * PlayerEventImageWipe registers the imageWipe playerEvent handler.
 */
class PlayerEventImageWipe {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._handleEvent = this._handleEvent.bind(this);

		this.app.require([ 'playerEvent', 'toaster' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;

		this.module.playerEvent.addHandler('imageWipe', this._handleEvent);
	}

	_handleEvent(ev, onClose) {
		let txt = ev.avatar ? avatarTxt : imageTxt;
		let info = txt.target[ev.target] || txt.default;
		return this.module.toaster.open({
			title: txt.title,
			content: close => new Elem(n => n.elem('div', [
				n.component(new Txt(info, { tagName: 'p' })),
				n.component(new Txt(ev.name, { tagName: 'p', className: 'dialog--strong dialog--large' })),
				n.component(new Html(moreInfoTxt, { tagName: 'div', className: 'common--sectionpadding' })),
			])),
			closeOn: 'click',
			onClose,
		});
	}

	dispose() {
		this.module.playerEvent.removeHandler('imageWipe');
	}
}

export default PlayerEventImageWipe;
