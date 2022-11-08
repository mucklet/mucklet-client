import { Elem, Txt } from 'modapp-base-component';
import { ModelComponent, ModelTxt } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import CharTagsList from 'components/CharTagsList';
import FormatTxt from 'components/FormatTxt';
import Collapser from 'components/Collapser';
import Fader from 'components/Fader';
import PanelSection from 'components/PanelSection';
import SimpleBar from 'components/SimpleBar';
import FAIcon from 'components/FAIcon';
import Dialog from 'classes/Dialog';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import idleLevels from 'utils/idleLevels';
import formatDateTime from 'utils/formatDateTime';
import './dialogAboutChar.scss';

const txtNotSet = l10n.l('dialogAboutChar.unknownGenderAndSpecies', "Unknown gender and species");
const txtWatch = l10n.l('dialogAboutChar.watch', "Watch");
const txtUnwatch = l10n.l('dialogAboutChar.unwatch', "Unwatch");

class DialogAboutChar {
	constructor(app, params) {
		this.app = app;

		this.app.require([ 'avatar', 'api', 'charsAwake', 'player', 'toaster' ], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	open(char) {
		if (this.dialog) return;

		this.dialog = true;

		this.module.api.get('core.char.' + char.id + '.info').then(charInfo => {

			let tags = new CharTagsList(char.tags, {
				className: 'common--sectionpadding',
				eventBus: this.app.eventBus,
			});
			let about = new PanelSection(
				l10n.l('dialogAboutChar.about', "About"),
				new ModelComponent(
					charInfo,
					new SimpleBar(
						new FormatTxt("", { className: 'common--desc-size' }),
						{ className: 'dialogaboutchar--about' },
					),
					(m, c) => c.getComponent().setFormatText(m.about),
				),
				{
					className: 'common--sectionpadding',
					open: true,
				},
			);

			this.dialog = new Dialog({
				title: l10n.l('dialogAboutChar.aboutChar', "About character"),
				className: 'dialogaboutchar',
				content: new ModelComponent(
					char,
					new Elem(n => n.elem('div', [
						n.elem('div', { className: 'flex-row pad12 pad-bottom-l' }, [
							n.elem('div', { className: 'flex-auto' }, [
								n.component(this.module.avatar.newAvatar(char, { size: 'large' })),
							]),
							n.elem('div', { className: 'flex-1' }, [
								n.component('name', new Txt('', {
									tagName: 'div',
									className: 'dialogaboutchar--fullname',
								})),
								n.component('genderspecies', new Txt('', {
									tagName: 'div',
									className: 'dialogaboutchar--genderspecies',
								})),
								n.elem('idleStatus', 'div', { className: 'dialogaboutchar--status flex-1' }, [
									n.component('idle', new Txt('')),
									n.component('status', new Txt('')),
								]),
							]),
							n.elem('div', { className: 'flex-auto' }, [
								n.component(new ModelComponent(
									this.module.charsAwake.getWatches(),
									new Fader(),
									(m, c, change) => {
										if (change && !change.hasOwnProperty(char.id)) return;
										let isWatched = m && m[char.id];

										c.setComponent(new Elem(n => n.elem('button', {
											className: 'btn lighten medium icon-left',
											events: {
												click: () => {
													let rid = 'note.player.' + this.module.player.getPlayer().id + '.watch.' + char.id;
													this.module.api.call(rid, isWatched ? 'delete' : 'addWatcher')
														.then(() => this.module.toaster.open({
															title: isWatched
																? l10n.l('dialogAboutChar.characterUnwatched', "Character unwatched")
																: l10n.l('dialogAboutChar.characterWatched', "Character watched"),
															content: new Txt(isWatched
																? l10n.l('dialogAboutChar.unwatchedCharacter', "Unwatched {name} {surname}", char)
																: l10n.l('dialogAboutChar.watchedCharacter', "Watched {name} {surname}", char),
															),
															closeOn: 'click',
															type: 'success',
															autoclose: true,
														}))
														.catch(err => this.module.toaster.openError(err));
												},
											},
										}, [
											n.component('ico', new FAIcon(isWatched ? 'eye-slash' : 'eye')),
											n.component('txt', new Txt(isWatched ? txtUnwatch : txtWatch)),
										])));
									},
								)),
							]),
						]),
						n.component(new ModelComponent(
							charInfo,
							new Collapser(),
							(m, c) => c.setComponent(m.about ? about : null),
						)),
						n.component(new ModelComponent(
							char.tags,
							new Collapser(),
							(m, c) => c.setComponent(Object.keys(m.props).length
								? tags
								: null,
							),
						)),
						n.elem('div', { className: 'dialogaboutchar--info common--sectionpadding' }, [
							n.component('lastAwake', new Txt('', {
								tagName: 'div',
								className: 'dialogaboutchar--lastawake',
							})),
							n.component('puppeteer', new Collapser()),
						]),
						n.elem('div', { className: 'pad-top-xl pad-bottom-m flex-row margin16' }, [
							n.elem('close', 'button', {
								className: 'btn primary flex-auto common--btnwidth',
								events: { click: () => this.close() },
							}, [
								n.component(new Txt(l10n.l('dialogAboutChar.close', "Close"))),
							]),
						]),
					])),
					(m, c, change) => {
						let genderSpecies = (firstLetterUppercase(m.gender) + ' ' + firstLetterUppercase(m.species)).trim();
						c.getNode('name').setText((m.name + " " + m.surname).trim());
						c.getNode('genderspecies')[genderSpecies ? 'removeClass' : 'addClass']('common--placeholder')
							.setText(genderSpecies || txtNotSet);
						c.getNode('lastAwake').setText(m.awake
							? l10n.l('dialogAboutChar.wokeUp', "Woke up {time}", { time: formatDateTime(new Date(m.lastAwake)) })
							: m.lastAwake
								? l10n.l('dialogAboutChar.lastSeen', "Last seen {time}", { time: formatDateTime(new Date(m.lastAwake)) })
								: l10n.l('dialogAboutChar.neverSeen', "Never seen"),
						);
						c.getNode('idle').setText(idleLevels[m.idle].text);
						c.getNode('status').setText(m.status ? ' (' + m.status + ')' : '');
						if (!change || change.hasOwnProperty('puppeteer')) {
							c.getNode('puppeteer').setComponent(m.puppeteer
							 	? new ModelTxt(
									 m.puppeteer,
									 m => l10n.l('dialogAboutChar.controlledBy', "Controlled by {fullname}", { fullname: (m.name + ' ' + m.surname).trim() }),
									 {
										tagName: 'div',
										className: 'dialogaboutchar--puppeteer',
									 },
								)
							 	: null,
							);
						}

						for (let i = 0; i < idleLevels.length; i++) {
							let lvl = idleLevels[i];
							c[i == m.idle ? 'addNodeClass' : 'removeNodeClass']('idleStatus', lvl.className);
						}


					},
				),
				onClose: () => { this.dialog = null; },
			});

			this.dialog.open();
			try {
				this.dialog.getContent().getNode('close').focus();
			} catch (e) {}
		});
	}

	close() {
		if (this.dialog) {
			this.dialog.close();
			return true;
		}
		return false;
	}

	_updateAbout(char, charInfo, c) {
		c.getNode('about').setFormatText(charInfo.about);
		if (!change || change.hasOwnProperty('tags')) {
			c.getNode('tags').setComponent(char.tags ? new CharTagsList(char.tags, {
				className: 'dialogaboutchar--tags',
				eventBus: this.app.eventBus,
			}) : null);
		}
	}
}

export default DialogAboutChar;
