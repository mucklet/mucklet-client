import Tooltip from 'classes/Tooltip';

const defaultCtx = {};

function getCtx(opt) {
	return (opt && opt.ctx) || defaultCtx;
}

function setListeners(ctx, on) {
	let cb = on ? 'addEventListener' : 'removeEventListener';
	document[cb]('keydown', ctx.close, true);
	document[cb]('click', ctx.close, true);
}

function tryClose(ev, ref, opt) {
	let ctx = getCtx(opt);
	if (ctx.ref !== ref) {
		return;
	}

	ctx.handledGlobally = ref;
	setTimeout(() => {
		if (ctx.handledGlobally === ref) {
			ctx.handledGlobally = null;
		}
	}, 0);

	if (!ctx.clicked && ev && ev.target && ref && ref.contains(ev.target)) {
		ctx.clicked = true;
		return;
	}

	close(ref, opt);
}

function createTooltip(ref, text, opt) {
	let ctx = getCtx(opt);

	clearTimeout(ctx.timeout);
	ctx.timeout = null;

	if (ctx.tooltip) {
		if (ctx.ref == ref) {
			return false;
		}
		ctx.tooltip.close();
	}

	ctx.ref = ref;
	ctx.tooltip = new Tooltip(text, ref, {
		margin: opt.margin || null,
		onClose: () => {
			if (ctx.ref === ref) {
				ctx.ref = null;
				ctx.tooltip = null;
				ctx.clicked = false;
				clearTimeout(ctx.timeout);
				ctx.timeout = null;
				setListeners(ctx, false);
			}
		},
	});
	ctx.close = (ev) => tryClose(ev, ref, opt);
	setListeners(ctx, true);

	return true;
}

/**
 * Opens a tooltip for the reference element by clicking on it.
 * @param {Element} ref Reference DOM element.
 * @param {String|LocaleString} text Tooltip text.
 * @param {object} [opt] Optional parameters.
 * @param {object} [opt.ctx] Optional context object. Only one tooltip will be open at the same time for any call using the same object.
 * @returns {Tooltip} Tooltip class.
 */
export function click(ref, text, opt) {
	let ctx = getCtx(opt);
	if (ctx.handledGlobally === ref) {
		return;
	}

	if (!text || ctx.clicked) {
		close(ref, opt);
		return null;
	}

	if (createTooltip(ref, text, opt)) {
		ctx.tooltip.open();
	}
	ctx.clicked = true;
	return ctx.tooltip;
}

/**
 * Opens a tooltip when moving the mouse over a reference element.
 * @param {Element} ref Reference DOM element.
 * @param {String|LocaleString} text Tooltip text.
 * @param {object} [opt] Optional parameters.
 * @param {object} [opt.ctx] Optional context object. Only one tooltip will be open at the same time for any call using the same object.
 * @returns {Tooltip} Tooltip class.
 */
export function mouseEnter(ref, text, opt) {
	let ctx = getCtx(opt);
	if (!text) {
		close(ref, opt);
		return null;
	}

	if (ctx.clicked) {
		return null;
	}

	if (createTooltip(ref, text, opt)) {
		ctx.tooltip.open();
	}
	return ctx.tooltip;
}

/**
 * Closes a tooltip after a while when the mouse leaves a reference element.
 * @param {Element} ref Reference DOM element.
 * @param {object} [opt] Optional parameters.
 * @param {object} [opt.ctx] Optional context object. Only one tooltip will be open at the same time for any call using the same object.
 * @returns {Tooltip} Tooltip class.
 */
export function mouseLeave(ref, opt) {
	let ctx = getCtx(opt);
	if (ctx.tooltip && !ctx.clicked && ctx.ref === ref) {
		clearTimeout(ctx.timeout);
		ctx.timeout = setTimeout(() => close(ref, opt), 300);
	}
	return ctx.tooltip;
}

/**
 * Closes a tooltip if it is open for the given reference DOM element.
 * @param {Element} ref Reference DOM element.
 * @param {object} [opt] Optional parameters.
 * @param {object} [opt.ctx] Optional context object. Only one tooltip will be open at the same time for any call using the same object.
 * @returns {boolean} Returns true if a tooltip was open for the reference DOM element, otherwise false..
 */
export function close(ref, opt) {
	let ctx = getCtx(opt);
	if (ctx.tooltip && ctx.ref === ref) {
		ctx.tooltip.close();
		return true;
	}
	return false;
}
