import { Elem, Txt } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import FAIcon from 'components/FAIcon';
import * as fullscreen from 'utils/fullscreen';

const txtFullscreen = l10n.l('fullscreen.fullscreen', "Fullscreen");
const txtFramed = l10n.l('fullscreen.framed', "Framed");

/**
 * Fullscreen draws player panel.
 */
class Fullscreen {
	constructor(app, params) {
		this.app = app;

		// Bind callbacks
		this._onClick = this._onClick.bind(this);

		this.app.require([
			'playerTools',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: this._getData(), eventBus: this.app.eventBus });
		this.fullscreenPromise = null;

		// Add kebab menu tool
		if (this.model.fullscreenEnabled) {
			this.module.playerTools.addTool({
				id: 'fullscreen',
				sortOrder: 5,
				componentFactory: click => {
					this.model.set(this._getData());
					return new Elem(n => n.elem('div', {
						className: 'kebabmenu--itembtn flex-row pad8',
						events: { click }
					}, [
						n.elem('div', { className: 'kebabmenu--itemicon flex-auto' }, [
							n.component(new FAIcon(this.model.isFullscreen ? 'compress' : 'expand'))
						]),
						n.component(new Txt(
							this.model.isFullscreen
								? txtFramed
								: txtFullscreen,
							{ className: 'flex-1' }
						))
					]));
				},
				onClick: this._onClick,
			});
		}
	}

	getModel() {
		return this.model;
	}

	_onClick() {
		this.fullscreenPromise = this.fullscreenPromise ||
			(this.model.isFullscreen
				? fullscreen.exitFullscreen()
				: fullscreen.requestFullscreen(document.documentElement)
			)
				.then(() => this.model.set(this._getData()))
				.catch(err => console.error(err))
				.then(() => this.fullscreenPromise = null);
	}

	_getData() {
		return {
			isFullscreen: !!fullscreen.fullscreenElement(),
			fullscreenEnabled: fullscreen.fullscreenEnabled()
		};
	}

	dispose() {
		if (this.model.fullscreenEnabled) {
			this.module.playerTools.removeTool('fullscreen');
		}
	}
}

export default Fullscreen;
