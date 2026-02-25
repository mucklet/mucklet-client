import { Elem } from 'modapp-base-component';
import { ModelTxt, CollectionList } from 'modapp-resource-component';
import { ModifyModel } from 'modapp-resource';
import tagTypes from 'utils/tagTypes';
import l10n from 'modapp-l10n';
import DialogSelectTagsSection from './DialogSelectTagsSection';


class DialogSelectTagsComponent {
	constructor(module, realm, tags, close) {
		this.module = module;
		this.realm = realm;
		this.tags = tags;
		this.close = close;
	}

	render(el) {
		this.model = new ModifyModel(this.realm.tags, {
			modifiedOnNew: true,
			eventBus: this.module.self.app.eventBus,
		});

		this.elem = new Elem(n => n.elem('div', { className: 'dialogselecttags' }, [
			n.component(new CollectionList(
				tagTypes,
				type => new DialogSelectTagsSection(
					this.module,
					this.tags,
					type,
					this.model,
				),
				{
					className: 'dialogselecttags--sections',
					subClassName: t => t.className || null,
				},
			)),
			n.elem('div', { className: 'dialogselecttags--footer pad-top-xl' }, [
				// Button
				n.elem('update', 'button', { events: {
					click: () => this._save(),
				}, className: 'btn primary common--btnwidth' }, [
					n.component(new ModelTxt(this.model, m => m.isModified
						? l10n.l('dialogSelectTags.update', "Update")
						: l10n.l('dialogSelectTags.close', "Close"))),
				]),
				// Counter
				n.component(this.module.realmSettingsTags.newCounter(this.model, {
					className: 'dialogselecttags--counter',
					count: (m) => Object.keys(m.props).filter(k => k != 'isModified').length, // Filter out isModified property of ModifyModel
				})),
			]),
		]));
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
		if (this.model) {
			this.tags.changes = this.model.getModifications() || {};
			this.model.dispose();
			this.model = null;
		}
	}

	_save() {
		let mods = this.model.getModifications();
		if (!mods) {
			this._close();
			return;
		}

		let o = {};
		for (let k in mods) {
			o[k] = !!mods[k];
		}

		return this.module.api.call(`control.realm.${this.realm.id}.tags`, 'setTags', {
			tags: o,
		}).then(() => {
			this._close();
		}).catch(err => this.module.toaster.openError(err));
	}

	_close() {
		this.close();
		if (this.model) {
			this.model.dispose();
			this.model = null;
		}
		this.tags.changes = {};
	}
}

export default DialogSelectTagsComponent;
