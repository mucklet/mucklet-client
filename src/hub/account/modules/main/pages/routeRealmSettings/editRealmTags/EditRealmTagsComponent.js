import { Elem, Txt, Context } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
// import RealmTagsList from 'components/RealmTagsList';
import AutoComplete from 'components/AutoComplete';
import FAIcon from 'components/FAIcon';
import patternMatch, { patternMatchRender, patternMatchCompare } from 'utils/patternMatch';


class EditRealmTagsComponent {
	constructor(module, realm, state) {
		this.module = module;
		this.realm = realm;
		this.state = state.editRealmTags || { tag: '' };
		state.editRealmTags = this.state;
	}

	render(el) {
		this.elem = new PanelSection(
			new Elem(n => n.elem('div', { className: 'editrealmtags--title' }, [
				n.component(new Txt(l10n.l('editRealmTags.tags', "Tags"), { tagName: 'h3' })),
				n.component(new Context(
					() => new CollectionWrapper(this.module.self.getTools(), {
						filter: t => (!t.type || t.type == 'title') && (t.filter ? t.filter(this.realm) : true),
					}),
					tools => tools.dispose(),
					tools => new CollectionList(
						tools,
						t => t.componentFactory(this.realm, this.state),
						{
							className: 'editrealmtags--tools',
							subClassName: t => t.className || null,
							horizontal: true,
						},
					),
				)),
			])),
			new Elem(n => n.elem('div', [
				n.elem('div', { className: 'common--sectionpadding' }, [
					n.elem('div', { className: 'editrealmtags--tag' }, [
						n.component('tag', new AutoComplete(this.state.tag, {
							attributes: {
								placeholder: l10n.t('editRealmTags.typeTagKey', "Enter tag keyword to add"),
								spellcheck: 'false',
							},
							fetch: (text, update, c) => {
								let tags = this.module.tags.getTagsCollection();
								update(tags.toArray()
									.filter(m => patternMatch(m.key, text) && this._tagIsValid(m.key))
									.map(m => ({ value: m.id, label: m.key }))
									.sort(patternMatchCompare(text, m => m.label))
									.slice(0, 10),
								);
							},
							events: {
								input: c => this._setTag(c.getProperty('value')),
								keydown: (c, e) => {
									if (e.key == 'Enter' && !c.isSelecting()) {
										e.preventDefault();
										e.stopPropagation();
										this._addTag();
									}
								},
							},
							render: patternMatchRender,
							minLength: 1,
							preventSubmit: true,
							onSelect: (c, item) => {
								this._setTag(item.label);
								c.setProperty('value', item.label);
								this._addTag();
							},
						})),
						n.elem('add', 'button', {
							className: 'editrealmtags--add iconbtn medium tinyicon',
							attributes: { type: 'button' },
							events: {
								click: (c, e) => {
									this._addTag();
									e.preventDefault();
								},
							},
						}, [
							n.component(new FAIcon('plus')),
						]),
					]),
				]),
				// n.component(new RealmTagsList(this.ctrl.tags, {
				// 	eventBus: this.module.self.app.eventBus,
				// 	onEdit: (tag, pref, tags) => this._editTag(tag, pref),
				// 	onDelete: (tag, pref, tags) => {
				// 		if (tag.custom) {
				// 			this.module.confirm.open(() => this._deleteTag(tag), {
				// 				title: l10n.l('editRealmTags.confirmDelete', "Confirm deletion"),
				// 				body: new Elem(n => n.elem('div', [
				// 					n.component(new Txt(l10n.l('editRealmTags.deleteCustomTagBody', "Do you wish to delete the custom tag?"), { tagName: 'p' })),
				// 					n.elem('p', [ n.component(new ModelTxt(tag, m => m.key, { className: 'dialog--strong' })) ]),
				// 				])),
				// 				confirm: l10n.l('editRealmTags.delete', "Delete"),
				// 			});
				// 		} else {
				// 			this._deleteTag(tag);
				// 		}
				// 	},
				// })),
			])),
			{
				className: 'editrealmtags common--sectionpadding',
				noToggle: true,
				popupTip: l10n.l('editRealmTags.tagsInfo', "Tags are searchable keywords describing a realm, the genres and themes."),
			},
		);
		this._setTag(this.state.tag);
		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
		}
	}

	_setTag(tag) {
		this.state.tag = tag;
		if (this.elem) {
			this.elem.getComponent().setNodeProperty('add', 'disabled', this._tagIsValid(tag.trim().toLowerCase()) ? null : 'disabled');
		}
	}

	_tagIsValid(v) {
		if (!v) return false;

		let tags = this.realm.tags.props;
		for (let k in tags) {
			if (tags[k].key == v) {
				return false;
			}
		}
		return true;
	}

	_deleteTag(tag) {
		return this.module.api.call(`control.realm.${this.realm.id}.tags`, 'setTags', { tags: { [ tag.id ]: null }})
			.catch(err => this.module.toaster.openError(err));
	}

	_editTag(tag, pref) {
		this.module.dialogTag.open(this.realm, tag, { pref });
	}

	_addTag() {
		if (!this.elem) return;

		let n = this.elem.getComponent().getNode('tag');
		let v = n.getProperty('value');
		if (this._tagIsValid(v)) {
			this.module.dialogTag.open(this.realm, v);
			n.setProperty('value', '');
			this._setTag('');
		}
	}
}

export default EditRealmTagsComponent;
