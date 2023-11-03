import Tooltip from 'classes/Tooltip';

const defaultCtx = {};

function getCtx(opt) {
	return (opt && opt.ctx) || defaultCtx;
}

function setListeners(ctx, on) {
	let cb = on ? 'addEventListener' : 'removeEventListener';
	document[cb]('keydown', ctx.onClick, true);
	document[cb]('click', ctx.onClick, true);
}

/**
 * On click callback called when document is click on while a tooltip is
 * rendered.
 * @param {object} ev Click event
 * @param {Element} ref Reference DOM element for the rendered tooltip.
 * @param {object} opt Options as provided when opening the tooltip.
 */
function onClick(ev, ref, opt) {
	let ctx = getCtx(opt);
	// Assert it is the callback handler for the right reference element.
	if (ctx.ref !== ref) {
		return;
	}

	ctx.closeTimeout = setTimeout(() => {
		close(ref, opt);
	}, 0);
}

function onClose(ctx, ref) {
	if (ctx.ref === ref) {
		ctx.ref = null;
		ctx.tooltip = null;
		ctx.clicked = false;
		clearTimeout(ctx.timeout);
		ctx.timeout = null;
		clearTimeout(ctx.closeTimeout);
		ctx.closeTimeout = null;
		setListeners(ctx, false);
	}
}

/**
 * Tries to create a tooltip unless a tooltip for the same reference DOM element
 * is already open. It will also clear any ongoing mouse-leave timeout.
 * @param {Element} ref Reference DOM element.
 * @param {String|LocaleString|Component} text Tooltip text.
 * @param {object} opt Optional parameters. Extends the options available for Tooltip.
 * @returns {bool} True if a new tooltip was opened. False if a tooltip for the ref already was open.
 */
function tryCreateTooltip(ref, text, opt) {
	opt = opt || {};

	let ctx = getCtx(opt);

	clearTimeout(ctx.timeout);
	ctx.timeout = null;
	clearTimeout(ctx.closeTimeout);
	ctx.closeTimeout = null;

	if (ctx.tooltip) {
		if (ctx.ref == ref) {
			return false;
		}
		ctx.tooltip.close();
	}

	ctx.ref = ref;
	ctx.tooltip = new Tooltip(text, ref, {
		className: opt.className,
		margin: opt.margin,
		padding: opt.padding,
		size: opt.size,
		offset: opt.offset,
		position: opt.position,
		onClose: () => onClose(ctx, ref),
	});
	ctx.onClick = (ev) => onClick(ev, ref, opt);
	setListeners(ctx, true);

	ctx.tooltip.open();

	return true;
}

/**
 * Prevents a click from closing the tooltip. Must be called while bubbling up
 * the click event.
 */
export function preventClose() {
	clearTimeout(ctx.closeTimeout);
	ctx.closeTimeout = null;
}

/**
 * Opens a tooltip for the reference element by clicking on it.
 * @param {Element} ref Reference DOM element.
 * @param {String|LocaleString|Component} text Tooltip text.
 * @param {object} [opt] Optional parameters. Extends the options available for Tooltip.
 * @param {object} [opt.ctx] Optional context object. Only one tooltip will be open at the same time for any call using the same object.
 * @returns {Tooltip} Tooltip class.
 */
export function click(ref, text, opt) {
	let ctx = getCtx(opt);

	if (!text) {
		close(ref, opt);
		return null;
	}

	// If the tooltip is opened by click, and it gets clicked a second time, we
	// let the onClick handler close it.
	if (ctx.ref === ref && ctx.clicked) {
		return null;
	}

	tryCreateTooltip(ref, text, opt);
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

	tryCreateTooltip(ref, text, opt);
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
