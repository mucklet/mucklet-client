import { Elem, Txt, Context } from 'modapp-base-component';
import { CollectionList } from 'modapp-resource-component';
import { CollectionWrapper } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PanelSection from 'components/PanelSection';
import RealmTagsList from 'components/RealmTagsList';
import AutoComplete from 'components/AutoComplete';
import FAIcon from 'components/FAIcon';
import patternMatch, { patternMatchRender, patternMatchCompare } from 'utils/patternMatch';
import EditRealmTagsCounter from './EditRealmTagsCounter';


class EditRealmTagsComponent {
	constructor(module, realm, state) {
		this.module = module;
		this.realm = realm;
		this.state = state.editRealmTags || { tag: '' };
		state.editRealmTags = this.state;
		this.tags = null;
	}

	render(el) {
		this._loadTags();

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
								this._loadTags().then(tags => {
									update(tags.toArray()
										.filter(m => patternMatch(m.key, text) && this._getValidTag(tags, m.key))
										.map(m => ({ value: m.id, label: m.key }))
										.sort(patternMatchCompare(text, m => m.label))
										.slice(0, 10),
									);
								});
							},
							events: {
								input: c => this._setTag(c.getProperty('value')),
								keydown: (c, e) => {
									if (e.key == 'Enter' && !c.isSelecting()) {
										e.preventDefault();
										e.stopPropagation();
										this._tryAdd();
									}
								},
							},
							render: patternMatchRender,
							minLength: 1,
							preventSubmit: true,
							onSelect: (c, item) => {
								this._setTag(item.label);
								c.setProperty('value', item.label);
								this._tryAdd();
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
				n.component(new RealmTagsList(this.realm.tags, {
					eventBus: this.module.self.app.eventBus,
					onDelete: (tag, pref, tags) => this._deleteTag(tag),
				})),
			])),
			{
				className: 'editrealmtags common--sectionpadding',
				noToggle: true,
				popupTip: l10n.l('editRealmTags.tagsInfo', "Tags are searchable keywords describing a realm, the genres and themes."),
				infoComponent: new EditRealmTagsCounter(this.module, this.realm.tags, {
					className: 'editrealmtags--counter',
					onUpdate: () => this._setCanAdd(),
				}),
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
		this._disposeTags();
	}

	_loadTags() {
		if (this.tags) {
			return Promise.resolve(this.tags);
		}
		return this.module.api.get('control.tags').then(tags => {
			if (this.elem && !this.tags) {
				this.tags = tags;
				this.tags.on();
			}
			return this.tags;
		});
	}

	_disposeTags() {
		if (this.tags) {
			this.tags.off();
			this.tags = null;
		}
	}

	_setTag(tag) {
		this.state.tag = tag;
		if (this.elem) {
			this._loadTags().then(tags => {
				if (this.elem) {
					let valid = !!this._getValidTag(tags, tag);
					this.elem.getComponent().getNode('tag')[valid ? 'removeClass' : 'addClass']('input--incomplete');
					this._setCanAdd();
				}
			});
		}
	}

	_tryAdd() {
		// Add it if possible
		this._canAdd().then(canAdd => {
			if (canAdd) {
				this._addTag();
			}
		});
	}

	async _canAdd() {
		if (!(this.state.tag || '').trim()) {
			return false;
		}
		let max = this.module.hubInfo.getControl().maxRealmTags;
		if (max && Object.keys(this.realm.tags.props).length >= max) {
			return false;
		}

		let tags = await this._loadTags();
		return !!this._getValidTag(tags, this.state.tag);
	}

	_setCanAdd(canAdd) {
		this._canAdd().then(canAdd => {
			if (this.elem) {
				this.elem.getComponent().setNodeProperty('add', 'disabled', canAdd ? null : 'disabled');
			}
		});
	}

	/**
	 * Checks if a key exists and is not already added to the realm.
	 * @param {ResCollection<TagModel>} tags Available tags
	 * @param {string} key Tag key to check
	 * @returns {TagModel | null} Valid tag, or null if not valid.
	 */
	_getValidTag(tags, key) {
		// Prepare key
		key = key.trim().toLowerCase().replace(/\s\s+/g, ' ');
		if (key) {
			let realmTags = this.realm.tags.props;
			for (let id in realmTags) {
				if (realmTags[id].key == key) {
					return null;
				}
			}
			for (let tag of tags) {
				if (tag.key == key) {
					return tag;
				}
			}
		}
		return null;
	}

	_deleteTag(tag) {
		return this.module.api.call(`control.realm.${this.realm.id}.tags`, 'setTags', { tags: { [ tag.id ]: false }})
			.catch(err => this.module.toaster.openError(err));
	}

	_editTag(tag, pref) {
		this.module.dialogTag.open(this.realm, tag, { pref });
	}

	_addTag() {
		if (!this.elem) return;

		let elem = this.elem;
		let n = this.elem.getComponent().getNode('tag');
		let v = n.getProperty('value');

		this._loadTags().then(tags => {
			let tag = this._getValidTag(tags, v);
			if (tag) {
				return this.module.api.call(`control.realm.${this.realm.id}.tags`, 'setTags', { tags: { [ tag.id ]: true }}).then(() => {
					if (this.elem == elem) {
						n.setProperty('value', '');
						this._setTag('');
					}
				}).catch(err => this.module.toaster.openError(err));
			}
		});
	}
}

export default EditRealmTagsComponent;
