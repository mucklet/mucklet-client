import { Elem, Txt } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import l10n from 'modapp-l10n';
import PopupTip from 'components/PopupTip';
import listenResource from 'utils/listenResource';
import './onboarding.scss';

/**
 * Onboarding handles onboarding popup tips for new players.
 *
 * It shows only a single popuptip at a time, and only as long as its step
 * is not completed. Multiple popuptip can use the same step.
 */
class Onboarding {
	constructor(app, params) {
		this.app = app;
		this.params = params;

		// Bind callbacks
		this._updateModel = this._updateModel.bind(this);

		this.app.require([
			'screen',
			'player',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = Object.assign({ self: this }, module);

		this.model = new Model({ data: {
			createChar: false,
			wakeupChar: false,
		}, eventBus: this.app.eventBus });

		this.player = null;

		this.module.player.getPlayerPromise().then(player => {
			if (!this.model) return;

			this.player = player;
			this._setListeners(true);
			this._updateModel();
		});

		this.tips = [];
	}

	getModel() {
		return this.model;
	}

	/**
	 * Shows an onboarding tooltip.
	 * @param {string} tipId Tip ID.
	 * @param {Element} el Element to track.
	 * @param {object} params Parameters.
	 * @param {LocaleString|Component} [params.title] Title text.
	 * @param {LocaleString|Component} params.content Tooltip content.
	 * @param {string} [params.position] Position of the tooltip. May be 'left', 'right', 'top', 'bottom'. Defaults to 'right'. }
	 * @param {Element} [params.parent] Parent element to render the tip inside. Defaults to body.
	 * @param {number} [params.priority] Priority.
	 */
	openTip(tipId, el, params) {
		if (!el) return;

		let current = this._current();
		// Prevent reopening the same tip.
		if (current?.tipId == tipId) return;

		this._clear(tipId);

		let parent = params.parent || document.body;
		let popupTip = new PopupTip(new Elem(n => n.elem('div', { className: 'onboarding--tip-body' }, [
			n.component(params.title
				? typeof params.title == 'string' || l10n.isLocaleString(params.title)
					? new Txt(params.title, { tagName: 'h3' })
					: params.title
				: null,
			),
			n.component(typeof params.content == 'string' || l10n.isLocaleString(params.content)
				? new Txt(params.content)
				: params.content,
			),
		])), {
			noIcon: true,
			noToggle: true,
			position: params.position || 'right',
			className: 'onboarding--tip popuptip--width-m',
			track: el,
		});
		popupTip.toggle(false);
		let o = { tipId, popupTip, parent, priority: params.priority || 0 };
		this.tips.push(o);
		this.tips.sort((a, b) => a.priority - b.priority);

		// If we have a new tip with highest priority, unrender the previous and
		// render the new.
		let newCurrent = this._current();
		if (newCurrent != current) {
			this._unrenderTip(current);
			this._renderTip(newCurrent);
		}
	}

	_renderTip(o) {
		o.popupTip.toggle(false);
		o.popupTip.render(o.parent);
		o.rendered = true;
		setTimeout(() => {
			if (o.rendered) {
				o.popupTip.toggle(true);
			}
		}, 300);
	}

	_unrenderTip(o) {
		if (o?.rendered) {
			o.popupTip.unrender();
			o.rendered = false;
		}
	}

	closeTip(tipId) {
		let current = this._current();
		if (current) {
			if (current.tipId == tipId) {
				this._unrenderTip(current);
				this._clear(tipId);
				current = this._current();
				if (current) {
					this._renderTip(current);
				}
			} else {
				this._clear(tipId);
			}
		}
	}

	_current() {
		return (this.tips.length && this.tips[this.tips.length - 1]) || null;
	}

	_clear(tipId) {
		this.tips = this.tips.filter(o => o.tipId != tipId);
	}

	_setListeners(on) {
		listenResource(this.player.chars, on, this._updateModel, 'add');
		listenResource(this.player.chars, on, this._updateModel, 'remove');
		listenResource(this.player.controlled, on, this._updateModel, 'add');
	}

	_updateModel() {
		if (!this.player) return;

		let o = {
			createChar: false,
			wakeupChar: false,
		};

		if (!this.player.chars.length) {
			o.createChar = true;
		} else {
			o.wakeupChar = true;
			for (let c of this.player.chars) {
				if (c.lastAwake) {
					o.wakeupChar = false;
					break;
				}
			}
		}

		this.model.set(o);
	}

	dispose() {
		this._setListeners(false);
		this.model = null;
		this.player = null;
	}
}

export default Onboarding;
