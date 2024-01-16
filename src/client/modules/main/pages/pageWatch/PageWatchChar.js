import { Elem, Txt } from 'modapp-base-component';
import { ModelTxt, ModelComponent } from 'modapp-resource-component';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
// import Collapser from 'components/Collapser';
import formatDateTime from 'utils/formatDateTime';
// import PageWatchCharContent from './PageWatchCharContent';

class PageWatchChar {
	constructor(module, watch, model) {
		this.module = module;
		this.watch = watch;
		this.char = watch.char;
		this.model = model;
	}

	render(el) {
		this.elem = new Elem(n => n.elem('div', { className: 'pagewatch-char' }, [
			n.elem('div', { className: 'pagewatch-char--badge badge btn margin4', events: {
				click: () => this.module.dialogAboutChar.open(this.char), // this._toggleInfo()
			}}, [
				n.elem('div', { className: 'badge--select' }, [
					n.component(this.module.avatar.newAvatar(this.char, { size: 'small', className: 'badge--icon' })),
					n.elem('div', { className: 'badge--info' }, [
						n.elem('div', { className: 'badge--title badge--nowrap' }, [
							n.component(new ModelTxt(this.char, c => c.name)),
							n.text(' '),
							n.component(new ModelTxt(this.char, c => c.surname)),
						]),
						n.elem('div', { className: 'badge--text badge--nowrap' }, [
							n.component(new ModelComponent(
								this.char,
								new Txt(),
								(m, c) => {
									c.setText(m.awake
										? l10n.l('pageWatch.currentlyAwake', "Currently awake")
										: l10n.l('pageWatch.lastSeen', "Seen {time}", { time: formatDateTime(new Date(m.lastAwake)) }),
									);
									c[m.awake ? 'addClass' : 'removeClass']('badge--strong');
									c[m.awake ? 'removeClass' : 'addClass']('badge--text');
								},
							)),
						]),
					]),
					n.component(new ModelComponent(
						this.module.charsAwake.getNotes(),
						new Elem(n => n.elem('div', { className: 'badge--tools' }, [
							n.elem('note', 'button', { className: 'pagewatch-char--note iconbtn medium tinyicon', events: {
								click: (c, ev) => {
									this.module.dialogEditNote.open(this.char.id);
									ev.stopPropagation();
								},
							}}, [
								n.component(new FAIcon('file-text')),
							]),
						])),
						(m, c) => c[m.props[this.char.id] ? 'addNodeClass' : 'removeNodeClass']('note', 'hasnote'),
					)),
				]),
				// n.component(new ModelComponent(
				// 	this.model,
				// 	new Collapser(null),
				// 	(m, c, change) => {
				// 		if (change && !change.hasOwnProperty('selectedCharId')) return;
				// 		c.setComponent(m.selectedCharId === this.char.id
				// 			? new PageWatchCharContent(this.module, this.watch, (show) => this._toggleInfo(show))
				// 			: null
				// 		);
				// 	}
				// ))
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

	_lookChar() {
		this.ctrl.call('look', { charId: this.char.id });
	}

	// _toggleInfo(show) {
	// 	show = typeof show == 'undefined'
	// 		? !this.model.selectedCharId || this.model.selectedCharId != this.char.id
	// 		: !!show;

	// 	this.model.set({ selectedCharId: show ? this.char.id : null });
	// }
}

export default PageWatchChar;
