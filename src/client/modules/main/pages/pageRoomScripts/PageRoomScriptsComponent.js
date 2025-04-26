import { Elem, Txt } from 'modapp-base-component';
import { CollectionList, CollectionComponent, ModelComponent, ModelTxt } from 'modapp-resource-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import Collapser from 'components/Collapser';
import FAIcon from 'components/FAIcon';
import PageRoomScriptsScript from './PageRoomScriptsScript';

class PageRoomScriptsComponent {
	constructor(module, scripts, ctrl, room, state, close) {
		this.module = module;
		this.scripts = scripts;
		this.ctrl = ctrl;
		this.room = room;
		state.scriptId = state.scriptId || null;
		this.state = state;
		this.close = close;
		this.model = null;

		// Bind callbacks
		this._onCreate = this._onCreate.bind(this);
	}

	render(el) {
		this.model = new Model({ data: this.state, eventBus: this.module.self.app.eventBus });
		let createScript = new Elem(n => n.elem('div', { className: 'common--addpadding' }, [
			n.elem('button', { events: { click: this._onCreate }, className: 'btn icon-left common--addbtn' }, [
				n.component(new FAIcon('plus')),
				n.component(new Txt(l10n.l('pageRoomScripts.createScript', "Create new script"))),
			]),
		]));
		this.elem = new Elem(n => n.elem('div', { className: 'pageroomscripts' }, [
			n.component(new ModelTxt(this.room, m => m.name, { tagName: 'div', className: 'common--itemtitle common--sectionpadding' })),
			n.component(new CollectionList(
				this.scripts,
				scripts => new PageRoomScriptsScript(this.module, this.ctrl, this.room, scripts, this.model, this.close),
				{ className: 'pageroomscripts--script' },
			)),
			n.component(new CollectionComponent(
				this.scripts,
				new Collapser(),
				(col, c, ev) => c.setComponent(col.length
					? null
					: new Txt(l10n.l('pageRoomScripts.noRoomScripts', "There are no room scripts"), { className: 'common--nolistplaceholder' }),
				),
			)),
			n.component(new ModelComponent(
				this.ctrl,
				new Collapser(),
				(m, c) => c.setComponent(m.puppeteer ? null : createScript),
			)),
		]));
		this.elem.render(el);
	}

	unrender() {
		if (this.elem) {
			Object.assign(this.state, this.model.props);
			this.model = null;
			this.elem.unrender();
			this.elem = null;
		}
	}

	_onCreate() {
		this.module.createLimits.validateRoomScripts(this.scripts, () => this.module.dialogCreateRoomScript.open(this.ctrl, {
			onCreate: (result) => this.module.dialogEditScriptSource.open(result.script.id, {
				boilerplateOnEmpty: true,
			}),
		}));
	}
}

export default PageRoomScriptsComponent;
