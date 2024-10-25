import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import PanelSection from 'components/PanelSection';
import FormatTxt from 'components/FormatTxt';
// import Img from 'components/Img';
import ModelCollapser from 'components/ModelCollapser';
import ModelFader from 'components/ModelFader';
import CharTagsList, { hasTags } from 'components/CharTagsList';
import FAIcon from 'components/FAIcon';
// import ImgModal from 'classes/ImgModal';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import errString from 'utils/errString';
import formatDateTime from 'utils/formatDateTime';
import { getCharIdleLevel } from 'utils/idleLevels';

const textNotSet = l10n.l('dialogCharSnapshotAttachment.notSet', "Not set");
const txtUnknown = l10n.l('dialogCharSnapshotAttachment.unknown', "(Unknown)");

/**
 * DialogCharSnapshotAttachmentSnapshot renders character info from a snapshot.
 */
class DialogCharSnapshotAttachmentSnapshot {
	constructor(module, snapshot, state) {
		this.module = module;
		this.snapshot = snapshot;
		this.state = state || {};
		this.state.description = this.state.description || {};
		this.state.lfrp = this.state.lfrp || {};
	}

	render(el) {
		let lvl = getCharIdleLevel(this.snapshot);
		let isAwake = this.snapshot.status != 'asleep';

		let about = new PanelSection(
			l10n.l('dialogCharSnapshotAttachment.about', "About"),
			new ModelComponent(
				this.snapshot,
				new Elem(n => n.elem('div', [
					n.component('about', new FormatTxt("", { className: 'common--desc-size', state: this.state.about })),
					n.component('tags', new Collapser()),
				])),
				(m, c, change) => {
					c.getNode('about').setFormatText(m.about);
					if (!change || change.hasOwnProperty('tags')) {
						c.getNode('tags').setComponent(m.tags ? new CharTagsList(m.tags, {
							className: 'dialogcharsnapshotattachment--tags',
							static: false,
							eventBus: this.module.self.app.eventBus,
							tooltipMargin: 'm',
						}) : null);
					}
				},
			),
			{
				className: 'common--sectionpadding',
				open: this.state.aboutOpen,
				onToggle: (c, v) => this.state.aboutOpen = v,
			},
		);

		this.elem = new Elem(n => n.elem('div', [

			n.elem('div', { className: 'flex-row pad12 pad-bottom-l' }, [
				n.elem('div', { className: 'flex-auto' }, [
					n.component(this.module.avatar.newAvatar(this.snapshot, {
						className: 'dialogcharsnapshotattachment--image badge--icon',
						size: 'large',
						resolve: (v) => v.href,
					})),
				]),
				n.elem('div', { className: 'flex-1' }, [
					n.component(new ModelTxt(this.snapshot, m => errString(m, m => (m.name + ' ' + m.surname).trim(), txtUnknown), { tagName: 'div', className: 'dialogcharsnapshotattachment--fullname' })),
					n.elem('div', { className: 'dialogcharsnapshotattachment--status' }, [
						n.elem('span', { className: (this.snapshot.lastAwake
							? isAwake && lvl
								? (' ' + lvl.className)
								: ''
							: ' common--placeholder'
						) }, [
							n.component(new Txt(
								isAwake && lvl
									? lvl.text
									: this.snapshot.lastAwake
										? l10n.l('dialogCharSnapshotAttachment.lastSeen', "Last seen {time}", { time: formatDateTime(new Date(this.snapshot.lastAwake)) })
										: l10n.l('dialogCharSnapshotAttachment.neverSeen', "Never seen"),
							)),
							n.component(this.snapshot.status ? new Txt(' (' + this.snapshot.status + ')') : null),
						]),
						n.component(this.snapshot.puppeteer
							? new Elem(n => n.elem('span', [
								n.component(new Txt(l10n.l('dialogCharSnapshotAttachment.controlledBy', ", controlled by "))),
								n.component(new ModelTxt(this.snapshot.puppeteer, m => errString(m, m => (m.name + ' ' + m.surname).trim(), txtUnknown))),
							]))
							: null,
						),
					]),
					n.elem('div', { className: 'dialogcharsnapshotattachment--timestamp flex-1' }, [
						n.component(new ModelTxt(this.snapshot, m => formatDateTime(new Date(m.timestamp)))),
					]),
				]),
				// Wipe avatar button
				n.component(new ModelFader(this.snapshot.avatar, [{
					condition: avatar => avatar?.href && !avatar?.deleted,
					factory: avatar => new Elem(n => n.elem('div', { className: 'dialogcharsnapshotattachment--imagebtn' }, [
						n.elem('button', {
							className: 'btn medium icon-left lighten',
							events: {
								click: () => this.module.confirm.open(() => this._wipeCharAvatar(), {
									title: l10n.l('dialogCharSnapshotAttachment.confirmWipe', "Confirm avatar wipe"),
									body: l10n.l('dialogCharSnapshotAttachment.wipeAvatarBody', "Do you really wish to wipe the avatar from the character's profiles?"),
									confirm: l10n.l('dialogCharSnapshotAttachment.wipeAvatar', "Wipe avatar"),
								}),
							},
						}, [
							n.component(new FAIcon('trash')),
							n.component(new Txt(l10n.l('dialogCharSnapshotAttachment.wipeAvatar', "Wipe avatar"))),
						]),
					])),
				}], {
					className: 'flex-auto',
				})),
			]),

			n.component(new ModelCollapser(this.snapshot, [{
				condition: m => m.image,
				factory: m => new PanelSection(
					l10n.l('dialogCharSnapshotAttachment.image', "Image"),
					new Elem(n => n.elem('div', { className: 'flex-row flex-stretch gap8' }, [
						n.elem('div', { className: 'flex-1' }, [
							n.component(this.module.avatar.newCharImg(this.snapshot, {
								className: 'dialogcharsnapshotattachment--image',
								size: 'xlarge',
								modalOnClick: true,
								resolve: v => v.href,
							})),
						]),
						// Wipe image button
						n.component(new ModelFader(m.image, [{
							condition: image => image?.href && !image?.deleted,
							factory: image => new Elem(n => n.elem('div', { className: 'dialogcharsnapshotattachment--imagebtn flex-auto' }, [
								n.elem('button', {
									className: 'btn medium icon-left lighten',
									events: {
										click: () => this.module.confirm.open(() => this._wipeCharImage(), {
											title: l10n.l('dialogCharSnapshotAttachment.confirmWipe', "Confirm image wipe"),
											body: l10n.l('dialogCharSnapshotAttachment.wipeImageBody', "Do you really wish to wipe the image from the character's profiles?"),
											confirm: l10n.l('dialogCharSnapshotAttachment.wipeImage', "Wipe image"),
										}),
									},
								}, [
									n.component(new FAIcon('trash')),
									n.component(new Txt(l10n.l('dialogCharSnapshotAttachment.wipeImage', "Wipe image"))),
								]),
							])),
						}])),
					])),
					{
						className: 'common--sectionpadding',
						noToggle: true,
					},
				),
			}])),
			n.elem('div', { className: 'flex-row pad8 common--sectionpadding' }, [
				n.elem('div', { className: 'flex-1' }, [
					n.component(new Txt(l10n.l('dialogCharSnapshotAttachment.gender', "Gender"), { tagName: 'h3', className: 'margin-bottom-m' })),
					n.elem('div', [
						n.component(new ModelComponent(
							this.snapshot,
							new Txt(),
							(m, c) => {
								c.setText(m.gender ? firstLetterUppercase(m.gender) : textNotSet);
								c[m.gender ? 'removeClass' : 'addClass']('dialogcharsnapshotattachment--notset');
							},
						)),
					]),
				]),
				n.elem('div', { className: 'flex-1' }, [
					n.component(new Txt(l10n.l('dialogCharSnapshotAttachment.species', "Species"), { tagName: 'h3', className: 'margin-bottom-m' })),
					n.elem('div', [
						n.component(new ModelComponent(
							this.snapshot,
							new Txt(),
							(m, c) => {
								c.setText(m.species ? firstLetterUppercase(m.species) : textNotSet);
								c[m.species ? 'removeClass' : 'addClass']('dialogcharsnapshotattachment--notset');
							},
						)),
					]),
				]),
			]),
			n.component(new ModelCollapser(this.snapshot, [
				{
					condition: m => m.rp == 'lfrp' && m.lfrpDesc,
					factory: m => new PanelSection(
						l10n.l('dialogCharSnapshotAttachment.lookingForRoleplay', "Looking for roleplay"),
						new ModelComponent(
							m,
							new FormatTxt("", { className: 'common--desc-size', state: this.state.lfrp }),
							(m, c) => c.setFormatText(m.lfrpDesc),
						),
						{
							className: 'common--sectionpadding',
							open: this.state.lfrpOpen,
							onToggle: (c, v) => this.state.lfrpOpen = v,
						},
					),
				},
				{
					condition: m => m.rp == 'lfrp',
					factory: m => new Txt(l10n.l('dialogCharSnapshotAttachment.currentlyLookingForRoleplay', "Currently looking for roleplay."), {
						className: 'dialogcharsnapshotattachment--lfrp-placeholder',
					}),
				},
			])),
			n.component(new PanelSection(
				l10n.l('pageChar.description', "Description"),
				new ModelComponent(
					this.snapshot,
					new FormatTxt("", { className: 'common--desc-size', state: this.state.description }),
					(m, c) => {
						c.setFormatText(m.desc ? m.desc : l10n.t(textNotSet));
						c[m.desc ? 'removeClass' : 'addClass']('dialogcharsnapshotattachment--notset');
					},
				),
				{
					className: 'common--sectionpadding',
					open: this.state.descriptionOpen,
					onToggle: (c, v) => this.state.descriptionOpen = v,
				},
			)),
			n.component(new ModelCollapser(this.snapshot, [{
				condition: m => m.howToPlay,
				factory: m => new PanelSection(
					l10n.l('pageChar.howToPlay', "How to play"),
					new ModelComponent(
						m,
						new FormatTxt("", { className: 'common--desc-size', state: this.state.howToPlay }),
						(m, c) => {
							c.setFormatText(m.howToPlay ? m.howToPlay : l10n.t(textNotSet));
							c[m.howToPlay ? 'removeClass' : 'addClass']('dialogcharsnapshotattachment--notset');
						},
					),
					{
						className: 'common--sectionpadding',
						open: this.state.howToPlayOpen,
						onToggle: (c, v) => this.state.howToPlayOpen = v,
					},
				),
			}])),
			n.component(new ModelComponent(
				this.snapshot,
				new ModelComponent(
					this.snapshot.tags,
					new Collapser(null),
					(m, c) => this._showAbout(c, about),
				),
				(m, c) => this._showAbout(c.getComponent(), about),
			)),
		]));

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_showAbout(c, about) {
		c.setComponent(this.snapshot.about || hasTags(this.snapshot.tags)
			? about
			: null,
		);
	}

	_wipeCharAvatar() {
		let imgRidParts = this.snapshot.avatar.getResourceId().split('.');

		return this.module.player.getPlayer().call('wipeCharAvatar', {
			charId: this.snapshot.id,
			avatar: imgRidParts[imgRidParts.length - 1],
		}).then(() => this.module.toaster.open({
			title: l10n.l('dialogCharSnapshotAttachment.avatarWiped', "Avatar wiped"),
			content: new Txt(l10n.l('dialogCloseTicket.avatarWipedInfo', "The avatar was wiped from the character.")),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		})).catch(err => this.module.toaster.openError(err, {
			title: l10n.l('dialogCharSnapshotAttachment.failedToWipeAvatar', "Failed to wipe avatar"),
		}));

	}

	_wipeCharImage() {
		let imgRidParts = this.snapshot.image.getResourceId().split('.');

		return this.module.player.getPlayer().call('wipeCharImage', {
			charId: this.snapshot.id,
			image: imgRidParts[imgRidParts.length - 1],
		}).then(() => this.module.toaster.open({
			title: l10n.l('dialogCharSnapshotAttachment.imageWiped', "Image wiped"),
			content: new Txt(l10n.l('dialogCloseTicket.imageWipedInfo', "The image was wiped from the character.")),
			closeOn: 'click',
			type: 'success',
			autoclose: true,
		})).catch(err => this.module.toaster.openError(err, {
			title: l10n.l('dialogCharSnapshotAttachment.failedToWipeImage', "Failed to wipe image"),
		}));
	}
}

export default DialogCharSnapshotAttachmentSnapshot;
