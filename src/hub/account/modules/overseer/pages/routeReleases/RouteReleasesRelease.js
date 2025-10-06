import { Elem, Txt, Context, Input } from 'modapp-base-component';
import { ModifyModel, ModelToCollection } from 'modapp-resource';
import { ModelComponent, CollectionList } from 'modapp-resource-component';
import PanelSection from 'components/PanelSection';
import NestedModel from 'classes/NestedModel';
import FAIcon from 'components/FAIcon';
import PageHeader from 'components/PageHeader';
import Collapser from 'components/Collapser';
import AutoComplete from 'components/AutoComplete';
import l10n from 'modapp-l10n';
import errString from 'utils/errString';
import RouteReleasesTemplateBadge from './RouteReleasesTemplateBadge';

/**
 * RouteReleasesRelease draws the settings form for a release.
 */
class RouteReleasesRelease {
	constructor(module, model, release) {
		this.module = module;
		this.model = model;
		this.release = release;
	}

	render(el) {
		this.messageComponent = new Collapser();
		this.elem = new Context(
			() => new ModifyModel(this.release, {
				eventBus: this.module.self.app.eventBus,
			}),
			release => release.dispose(),
			release => new Elem(n => n.elem('div', { className: 'routereleases-release' }, [
				n.elem('div', { className: 'flex-row flex-end' }, [
					n.component(new ModelComponent(
						this.release,
						new PageHeader("", "", { className: 'flex-1' }),
						(m, c) => c.setTitle(m.type == 'realm'
							? l10n.l('routeReleases.editRealmRelease', "Edit realm release")
							: m.type == 'node'
								? l10n.l('routeReleases.editNodeRelease', "Edit node release")
								: l10n.l('routeReleases.editRelease', "Edit release"),
						),
					)),
					n.elem('div', { className: 'flex-col' }, [
						n.elem('button', {
							className: 'btn fa small',
							events: {
								click: (c, ev) => {
									ev.stopPropagation();
									this.module.self.setRoute();
								},
							},
						}, [
							n.component(new FAIcon('angle-left')),
							n.component(new Txt(l10n.l('routeReleases.backToReleases', "Back to Releases"))),
						]),
					]),
				]),
				n.elem('div', { className: 'common--hr' }),


				// Name
				n.component(new PanelSection(
					l10n.l('routeReleases.name', "Name"),
					new ModelComponent(
						release,
						new Input("", {
							events: { input: c => release.set({ name: c.getValue() }) },
							attributes: { name: 'routereleases-name', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.name),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeReleases.nameInfo', "Human readable version name of the release, such as \"1.23.4\" or \"1.24.0-rc1\"."),
					},
				)),

				// Version
				n.component(new PanelSection(
					l10n.l('routeReleases.version', "Version"),
					new ModelComponent(
						release,
						new Input("", {
							events: { input: c => release.set({ version: c.getValue() }) },
							attributes: { name: 'routereleases-version', spellcheck: 'false' },
						}),
						(m, c) => c.setValue(m.version),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeReleases.versionInfo', "Release version in the format \"MAJOR.MINOR.PATCH\"."),
					},
				)),

				// Next version
				n.component(new PanelSection(
					l10n.l('routeReleases.updatesTo', "Upgrades to"),
					new ModelComponent(
						release,
						new AutoComplete({
							className: 'routereleases-release--next',
							innerClassName: 'autocomplete-dark',
							attributes: {
								placeholder: l10n.t('routeReleases.searchRelease', "Search release (Name)"),
								name: 'routereleases-release--next',
							},
							events: {
								input: (c, ev) => {
									if (!ev.target.value) {
										release.set({ next: null });
									}
								},
							},
							fetch: (text, update) => {
								this.module.api.call(`control.overseer.releases.${this.release.type}`, 'search', { text, limit: 20 })
									.then(releases => {
										update(releases.hits.map(o => Object.assign(o, {
											label: o.name,
										})));
									});
							},
							minLength: 1,
							onSelect: (c, item) => {
								c.setProperty('value', item.label);
								release.set({ next: item.id == (this.release.next?.id)
									? this.release.next
									: item,
								});
							},
						}),
						(m, c) => c.setProperty('value', m.next?.name || ''),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeReleases.upgradesToInfo', "The newer release which this release will upgrade to. Once set, realms using this release version may upgrade to the next one."),
					},
				)),

				// Templates
				n.component(new PanelSection(
					l10n.l('routeReleases.templates', "Templates"),
					new Context(
						() => new ModelToCollection(new NestedModel(
							release,
							(m) => Object.keys(m.templates || {}).reduce((o, key) => {
								return Object.assign(o, { [key]: key });
							}, {}) || {},
							{
								maxDepth: 1, // Listen to release only
							},
						), {
							compare: (a, b) => a.key.localeCompare(b.key),
							eventBus: this.module.self.eventBus,
						}),
						templates => {
							templates.getModel().dispose();
							templates.dispose();
						},
						templates => new CollectionList(
							templates,
							key => new RouteReleasesTemplateBadge(this.module, release, key),
							{
								subClassName: () => 'routereleases-release--template',
							},
						),
					),
					{
						className: 'common--sectionpadding',
						noToggle: true,
						popupTip: l10n.l('routeReleases.templateInfo', "Composition templates for the release."),
					},
				)),

				// Message
				n.component(this.messageComponent),

				// Footer
				n.elem('div', { className: 'pad-top-xl flex-row margin8 flex-end' }, [
					n.elem('div', { className: 'flex-1' }, [
						n.component(new ModelComponent(
							release,
							new Elem(n => n.elem('button', {
								className: 'btn primary common--btnwidth',
								events: {
									click: () => this._save(release),
								},
							}, [
								n.component(new Txt(l10n.l('routeReleases.saveChanges', "Save changes"))),
							])),
							(m, c) => c.setProperty('disabled', m.isModified ? null : 'disabled'),
						)),
					]),

					// Footer tools
					n.elem('div', { className: 'flex-auto flex-row margin4 routereleases-release-footertools' }, [
						// Delete
						n.elem('button', { events: {
							click: () => this.module.confirm.open(() => this._callRelease('delete')
								.then(() => {
									this.module.self.setRoute();
									this.module.toaster.open({
										title: l10n.l('routeReleases.releaseDeleted', "Release deleted"),
										content: new Elem(n => n.elem('div', [
											n.component(new Txt(l10n.l('routeReleases.releaseDeletedBody', "Release was successfully deleted:"), { tagName: 'p' })),
											n.component(new Txt(this.release.name, { tagName: 'p', className: 'dialog--strong' })),
										])),
										closeOn: 'click',
										type: 'success',
										autoclose: true,
									});
								}),
							{
								title: l10n.l('routeReleases.confirmDelete', "Confirm deletion"),
								body: l10n.l('routeReleases.deleteReleaseBody', "Do you really wish to delete this release?"),
								confirm: l10n.l('routeReleases.delete', "Delete"),
							}),
						}, className: 'iconbtn medium solid' }, [
							n.component(new FAIcon('trash')),
						]),
					]),
				]),

			])),
		);

		return this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			this.elem.unrender();
			this.elem = null;
			this.messageComponent = null;
		}
	}

	_save(model) {
		let params = model.getModifications();
		if (!params) {
			return;
		}

		// Prepare next
		if (params.hasOwnProperty('next')) {
			params.nextId = params.next?.id || null;
			delete params.next;
		}

		this._setMessage();
		return this.release.call('set', params).then(() => {
			model.reset();
		}).catch(err => {
			this._setMessage(errString(err));
		});
	}

	_setMessage(msg) {
		this.messageComponent?.setComponent(msg
			? new Txt(msg, { className: 'dialog--error' })
			: null,
		);
	}

	_callRelease(method, params) {
		return this.module.api.call(`control.overseer.release.${this.release.id}`, method, params);
	}
}

export default RouteReleasesRelease;
