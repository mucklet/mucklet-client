import { Context, Elem } from 'modapp-base-component';
import { ModelTxt, CollectionList } from 'modapp-resource-component';
import { ModifyModel, ModelWrapper, ModelToCollection } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PageSelectTagsSection from './PageSelectTagsSection';

function getTagId(k) {
	return k.slice(0, k.lastIndexOf('_'));
}

function getTagPref(k) {
	return k.slice(k.lastIndexOf('_') + 1);
}

class PageSelectTagsComponent {
	constructor(module, ctrl, state, close) {
		state.changes = state.changes || {};

		this.module = module;
		this.ctrl = ctrl;
		this.state = state;
		this.close = close;
	}

	render(el) {
		this.model = new ModifyModel(this.ctrl.tags, {
			props: this.state.changes,
			modifiedOnNew: true,
			eventBus: this.module.self.app.eventBus,
		});

		this.elem = new Context(
			() => new ModelWrapper(this.ctrl.tags, {
				filter: (k, v) => v.custom,
				keyMap: (k, v) => v.key,
				eventBus: this.module.self.eventBus
			}),
			custom => custom.dispose(),
			custom => new Elem(n => n.elem('div', { className: 'pageselecttags' }, [
				n.component(new CollectionList(
					this.module.tags.getGroupsCollection(),
					group => new PageSelectTagsSection(
						this.module,
						this.module.tags.getTagsCollection(),
						group,
						this.model,
						custom
					),
					{
						className: 'pageeditchar--sections',
						subClassName: t => t.className || null
					}
				)),
				n.component(new PageSelectTagsSection(
					this.module,
					this.module.tags.getTagsCollection(),
					{ name: l10n.l('pageSelectTags.other', "Other") },
					this.model,
					custom
				)),
				n.component(new PageSelectTagsSection(
					this.module,
					this.module.tags.getTagsCollection(),
					{ name: l10n.l('pageSelectTags.titles', "Titles") },
					this.model,
					custom,
					{ isRoleTags: true }
				)),
				n.component(new Context(
					() => new ModelToCollection(custom, {
						compare: (a, b) => a.value.key.localeCompare(b.value.key) || a.key.localeCompare(b.key),
						eventBus: this.module.self.eventBus
					}),
					col => col.dispose(),
					col => new PageSelectTagsSection(
						this.module,
						col,
						{ name: l10n.l('pageSelectTags.custom', "Custom") },
						this.model,
						null,
						{ className: 'pageselecttags--custom' }
					)
				)),
				n.elem('div', { className: 'pad-top-xl' }, [
					n.elem('update', 'button', { events: {
						click: () => this._save()
					}, className: 'btn primary common--btnwidth' }, [
						n.component(new ModelTxt(this.model, m => m.isModified
							? l10n.l('pageSelectTags.update', "Update")
							: l10n.l('pageSelectTags.close', "Close")))
					])
				])
			]))
		);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
		if (this.model) {
			this.state.changes = this.model.getModifications() || {};
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
		// Delete tags no longer used
		for (let k in mods) {
			if (!mods[k]) {
				o[getTagId(k)] = null;
			}
		}
		// Add new tags, or overwrite "deleted" tags in case of pref switch.
		for (let k in mods) {
			let m = mods[k];
			if (m) {
				o[getTagId(k)] = getTagPref(k);
			}
		}

		return this.module.api.call('tag.char.' + this.ctrl.id + '.tags', 'setTags', {
			tags: o
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
		this.state.changes = {};
	}
}

export default PageSelectTagsComponent;
