import { adjust, alpha, mix } from "utils/color";

/**
 * Standard tokens used by the app.
 */
const tokens = {

	// Primitive colors
	'color.base.100': (getToken) => adjust(getToken('color.base'), -4),
	'color.base.200': (getToken) => getToken('color.base'),
	'color.base.300': (getToken) => adjust(getToken('color.base'), 4),
	'color.base.400': (getToken) => adjust(getToken('color.base'), 8),
	'color.base.500': (getToken) => adjust(getToken('color.base'), 12),
	'color.base.600': (getToken) => adjust(getToken('color.base'), 16),

	'color.accent.300': (getToken) => getToken('color.accent'),
	'color.contrast.200': (getToken) => adjust(getToken('color.contrast'), -16),
	'color.contrast.300': (getToken) => getToken('color.contrast'),

	'color.neutral.100': (getToken) => adjust(getToken('color.neutral'), -24),
	'color.neutral.200': (getToken) => adjust(getToken('color.neutral'), -16),
	'color.neutral.300': (getToken) => getToken('color.neutral'),
	'color.neutral.400': (getToken) => adjust(getToken('color.neutral'), 4),
	'color.neutral.500': (getToken) => adjust(getToken('color.neutral'), 8),
	'color.neutral.600': (getToken) => adjust(getToken('color.neutral'), 16),
	'color.neutral.700': (getToken) => adjust(getToken('color.neutral'), 20),

	'color.danger.100': (getToken) => adjust(getToken('color.danger'), -16),
	'color.danger.200': (getToken) => adjust(getToken('color.danger'), -8),
	'color.danger.300': (getToken) => getToken('color.danger'),
	'color.danger.400': (getToken) => adjust(getToken('color.danger'), 6),

	'color.action.100': (getToken) => adjust(getToken('color.action'), -16),
	'color.action.200': (getToken) => adjust(getToken('color.action'), -8),
	'color.action.300': (getToken) => getToken('color.action'),

	// Semantic surfaces and content
	'surface.100.bg': (getToken) => getToken('color.base.100'),
	'surface.200.bg': (getToken) => getToken('color.base.200'),
	'surface.300.bg': (getToken) => getToken('color.base.300'),
	'surface.400.bg': (getToken) => getToken('color.base.400'),
	'surface.500.bg': (getToken) => getToken('color.base.500'),
	'surface.600.bg': (getToken) => getToken('color.base.600'),
	'surface.overlay.bg': (getToken) => alpha(adjust(getToken('color.base.200'), -10), 0.9),
	'surface.raised.shadow': 'rgba(0, 0, 0, 0.3)',

	'content.default.fg': (getToken) => getToken('color.neutral.300'),
	'content.strong.fg': (getToken) => getToken('color.contrast.300'),
	'content.accent.fg': (getToken) => getToken('color.accent.300'),
	'content.muted.fg': (getToken) => getToken('color.neutral.200'),
	'content.subtle.fg': (getToken) => getToken('color.neutral.100'),
	'content.disabled.fg': (getToken) => getToken('color.neutral.100'),
	'content.error.fg': (getToken) => getToken('color.danger.300'),
	'content.placeholder.fg': (getToken) => adjust(getToken('color.base.200'), 24, -15),

	'content.danger.fg': (getToken) => getToken('color.danger.300'),
	'content.info.fg': (getToken) => getToken('color.action.300'),
	'content.success.fg': '#458136',
	'content.warning.fg': (getToken) => getToken('color.accent.300'),
	'content.active.fg': (getToken) => getToken('color.action.300'),
	'content.inactive.fg': (getToken) => getToken('color.neutral.300'),

	'control.default.300.bg': (getToken) => getToken('color.base.300'),
	'control.default.300.bg.hover': (getToken) => getToken('color.base.400'),
	'control.default.300.bg.active': (getToken) => getToken('color.base.500'),
	'control.default.300.fg': (getToken) => getToken('color.neutral.300'),
	'control.default.300.fg.hover': (getToken) => getToken('color.neutral.400'),
	'control.default.400.bg': (getToken) => getToken('color.base.400'),
	'control.default.400.bg.hover': (getToken) => getToken('color.base.500'),
	'control.default.400.bg.active': (getToken) => getToken('color.base.600'),
	'control.default.400.fg': (getToken) => getToken('color.neutral.400'),
	'control.default.400.fg.hover': (getToken) => getToken('color.neutral.500'),
	'control.default.500.bg': (getToken) => getToken('color.base.500'),
	'control.default.500.bg.hover': (getToken) => getToken('color.base.600'),
	'control.default.500.bg.active': (getToken) => getToken('color.base.600'),
	'control.default.500.fg': (getToken) => getToken('color.neutral.400'),
	'control.default.500.fg.hover': (getToken) => getToken('color.neutral.500'),
	'control.primary.bg': (getToken) => getToken('color.action.300'),
	'control.primary.bg.hover': (getToken) => getToken('color.action.200'),
	'control.primary.bg.active': (getToken) => getToken('color.action.100'),
	'control.primary.fg': (getToken) => getToken('color.base.300'),
	'control.primary.fg.hover': (getToken) => getToken('color.base.400'),
	'control.secondary.bg': (getToken) => getToken('color.neutral.300'),
	'control.secondary.bg.hover': (getToken) => getToken('color.neutral.200'),
	'control.secondary.bg.active': (getToken) => getToken('color.neutral.100'),
	'control.secondary.fg': (getToken) => getToken('color.base.300'),
	'control.secondary.fg.hover': (getToken) => getToken('color.base.400'),
	'control.danger.bg': (getToken) => getToken('color.danger.300'),
	'control.danger.bg.hover': (getToken) => getToken('color.danger.200'),
	'control.danger.bg.active': (getToken) => getToken('color.danger.100'),
	'control.danger.fg': '#000',
	'control.recessed.bg': (getToken) => getToken('color.base.200'),
	'control.recessed.bg.hover': (getToken) => getToken('color.base.100'),
	'control.recessed.bg.active': (getToken) => getToken('color.base.100'),
	'control.recessed.fg': (getToken) => getToken('color.neutral.300'),
	'control.recessed.fg.hover': (getToken) => getToken('color.neutral.400'),
	'control.placeholder.fg': (getToken) => adjust(getToken('color.base.200'), 34, -15),
	'control.overlay.bg': (getToken) => 'rgba(255, 255, 255, 0.02)',
	'control.overlay.bg.hover': (getToken) => 'rgba(255, 255, 255, 0.06)',
	'control.overlay.bg.active': (getToken) => 'rgba(255, 255, 255, 0.08)',

	'input.default.bg': (getToken) => getToken('color.base.500'),
	'input.default.fg': (getToken) => getToken('color.contrast.300'),
	'input.default.placeholder.fg': (getToken) => getToken('control.placeholder.fg'),
	'input.default.caret': (getToken) => getToken('color.contrast.300'),
	'input.incomplete.fg': (getToken) => getToken('color.neutral.400'),

	'divider.default.border': (getToken) => getToken('color.base.400'),
	'divider.muted.border': (getToken) => getToken('color.base.300'),
	'divider.subtle.border': (getToken) => getToken('color.base.200'),
	'divider.strong.border': (getToken) => getToken('color.neutral.300'),
	'divider.contrast.border': '#000',
	'divider.accent.border': (getToken) => getToken('color.accent.300'),

	'link.default.fg': (getToken) => getToken('color.action.300'),
	'link.default.fg.hover': (getToken) => getToken('color.action.200'),
	'link.default.fg.active': (getToken) => getToken('color.action.100'),
	'focus.ring': (getToken) => getToken('color.accent.300'),

	'scrollbar.thumb.bg': (getToken) => getToken('color.neutral.300'),

	'status.danger.bg': (getToken) => getToken('color.danger.300'),
	'status.danger.fg': (getToken) => getToken('color.base.200'),
	'status.danger.border': (getToken) => getToken('color.danger.300'),
	'status.info.bg': (getToken) => getToken('color.action.300'),
	'status.info.fg': (getToken) => getToken('color.base.200'),
	'status.info.border': (getToken) => getToken('color.action.300'),
	'status.success.bg': '#458136',
	'status.success.fg': (getToken) => getToken('color.base.200'),
	'status.success.border': '#458136',
	'status.warning.bg': (getToken) => getToken('color.accent.300'),
	'status.warning.fg': (getToken) => getToken('color.base.200'),
	'status.warning.border': (getToken) => getToken('color.accent.300'),
	'status.active.bg': (getToken) => getToken('color.action.300'),
	'status.active.fg': (getToken) => getToken('color.base.200'),
	'status.active.border': (getToken) => getToken('color.action.300'),
	'status.inactive.bg': (getToken) => getToken('color.neutral.300'),
	'status.inactive.fg': (getToken) => getToken('color.base.200'),
	'status.inactive.border': (getToken) => getToken('color.neutral.300'),

	// IdleLevel colors
	'idlelevel.asleep.fg': (getToken) => getToken('color.neutral.300'),
	'idlelevel.active.fg': (getToken) => getToken('color.contrast.300'),
	'idlelevel.idle.fg': (getToken) => getToken('color.accent.300'),
	'idlelevel.away.fg': (getToken) => mix(getToken('color.danger.300'), getToken('color.accent.300'), 80),
	'idlelevel.bot.fg': (getToken) => mix(getToken('color.action.300'), getToken('color.contrast.300'), 80),

	// Log colors
	'log.error.fg': (getToken) => mix(getToken('color.danger.300'), getToken('color.neutral.300'), 70),
	'log.cmd.fg': (getToken) => getToken('color.accent.300'),
	'log.attr.fg': (getToken) => getToken('color.accent.300'),
	'log.listitem.fg': (getToken) => mix(getToken('color.action.300'), getToken('color.neutral.300'), 50),
	'log.delim.fg': (getToken) => getToken('color.neutral.300'),
	'log.text.fg': (getToken) => getToken('color.neutral.600'),
	'log.entityid.fg': (getToken) => getToken('color.neutral.600'),
	'log.bot.fg': (getToken) => getToken('idlelevel.bot.fg'),
	'log.instance.fg': (getToken) => mix(getToken('color.action.300'), getToken('color.neutral.300'), 60),
	'log.card.bg': (getToken) => mix(getToken('color.accent.300'), getToken('color.base.200'), 10),
	'log.strong.fg': (getToken) => getToken('content.strong.fg'),
	'log.default.fg': (getToken) => getToken('content.default.fg'),
	'log.ooc.fg': (getToken) => getToken('color.neutral.200'),
	'log.comm.fg': (getToken) => getToken('color.neutral.600'),
	'log.placeholder.fg': (getToken) => getToken('color.neutral.200'),
	'log.char.fg': (getToken) => getToken('log.listitem.fg'),
	'log.source.fg': (getToken) => getToken('log.text.fg'),
	'log.info.fg': (getToken) => getToken('color.neutral.200'),
	'log.title.fg': (getToken) => getToken('color.contrast.200'),
	'log.code.fg': (getToken) => getToken('color.accent.300'),
	'log.code.bg': (getToken) => getToken('surface.100.bg'),
	'log.header.fg': (getToken) => getToken('color.accent.300'),
	'log.link.fg': (getToken) => getToken('link.default.fg'),
	'log.cmd.ooc.fg': (getToken) => getToken('color.neutral.300'),
	'log.formatter.fg': (getToken) => getToken('color.neutral.200'),
	'log.emphasis.fg': (getToken) => getToken('color.action.300'),
	'log.fieldset.border': (getToken) => getToken('color.neutral.200'),
	'log.fieldset.label.fg': (getToken) => getToken('log.default.fg'),
	'log.fieldset.label.bg': (getToken) => getToken('surface.200.bg'),
	'log.active.fg': (getToken) => getToken('content.active.fg'),
	'log.inactive.fg': (getToken) => getToken('color.base.400'),
	'log.highlight.fg': (getToken) => getToken('color.neutral.600'),
	'log.highlight.bg': (getToken) => getToken('surface.400.bg'),
	'log.highlight.ooc.fg': (getToken) => getToken('color.neutral.400'),
	'log.highlight.comm.fg': (getToken) => getToken('color.contrast.300'),
	'log.highlight.event.bg': (getToken) => getToken('surface.300.bg'),
	'log.highlight.event.fg': (getToken) => getToken('color.neutral.400'),
	'log.highlight.event.ooc.fg': (getToken) => getToken('color.neutral.300'),
	'log.highlight.event.comm.fg': (getToken) => getToken('color.neutral.700'),
	'log.highlight.active.bg': (getToken) => getToken('surface.500.bg'),
	'log.highlight.active.fg': (getToken) => getToken('color.neutral.500'),
	'log.highlight.active.comm.fg': '#fff',

	// Tag colors
	'tag.default.fg': (getToken) => getToken('color.neutral.300'),
	'tag.default.border': (getToken) => getToken('tag.default.fg'),
	'tag.default.fg.hover': (getToken) => getToken('color.neutral.500'),
	'tag.default.border.hover': (getToken) => getToken('tag.default.fg.hover'),
	'tag.dislike.fg': (getToken) => getToken('color.danger.300'),
	'tag.dislike.border': (getToken) => getToken('tag.dislike.fg'),
	'tag.dislike.fg.hover': (getToken) => getToken('color.danger.400'),
	'tag.dislike.border.hover': (getToken) => getToken('tag.dislike.fg.hover'),
	'tag.title.fg': (getToken) => getToken('color.action.300'),
	'tag.title.border': (getToken) => getToken('tag.title.fg'),
	'tag.title.fg.hover': (getToken) => getToken('color.action.200'),
	'tag.title.border.hover': (getToken) => getToken('tag.title.fg.hover'),
	'tag.icon.fg': (getToken) => getToken('color.base.200'),

	// SVGs
	'svg.placeholder.100.bg': (getToken) => getToken('surface.300.bg'),
	'svg.placeholder.100.fg': (getToken) => getToken('surface.100.bg'),
	'svg.placeholder.200.bg': (getToken) => getToken('surface.400.bg'),
	'svg.placeholder.200.fg': (getToken) => getToken('surface.200.bg'),

	// src/common/scss/_badge.scss
	'badge.100.bg': (getToken) => getToken('surface.100.bg'),
	'badge.100.bg.hover': (getToken) => adjust(getToken('color.base.200'), -6),
	'badge.200.bg': (getToken) => getToken('surface.200.bg'),
	'badge.200.fg': '#fff',
	'badge.200.bg.hover': (getToken) => getToken('surface.100.bg'),
	'badge.avatar.bg': (getToken) => getToken('surface.400.bg'),
	'badge.avatar.fg': (getToken) => getToken('surface.200.bg'),
	'badge.dark.avatar.bg': (getToken) => getToken('surface.300.bg'),
	'badge.dark.avatar.fg': (getToken) => getToken('surface.100.bg'),
	'badge.symbol.fg': (getToken) => getToken('content.default.fg'),
	'badge.icon.bg': (getToken) => getToken('surface.400.bg'),
	'badge.icon.fg': (getToken) => getToken('content.default.fg'),
	'badge.text.fg': (getToken) => getToken('content.default.fg'),
	'badge.title.fg': (getToken) => getToken('content.accent.fg'),
	'badge.subtitle.fg': (getToken) => getToken('content.accent.fg'),
	'badge.strong.fg': (getToken) => getToken('content.strong.fg'),
	'badge.highlight.fg': (getToken) => getToken('log.instance.fg'),
	'badge.error.fg': (getToken) => getToken('content.error.fg'),
	'badge.divider.border': (getToken) => getToken('surface.500.bg'),

	// src/common/scss/_common.scss
	'common.format.divider.border': 'rgba(255, 255, 255, 0.2)',
	'common.addbtn.fg.hover': (getToken) => getToken('color.neutral.500'),

	// src/common/classes/dialog.scss
	'dialog.overlay.bg': '#000',
	'dialog.input.bg': (getToken) => getToken('color.neutral.500'),
	'dialog.input.bg.hover': (getToken) => getToken('color.neutral.300'),
	'dialog.input.fg': '#000',

	// src/common/classes/imgModal.scss
	'imgmodal.overlay.bg': 'rgba(0, 0, 0, 0.5)',
	'imgmodal.shadow': '#000',

	// src/common/scss/_kbd.scss
	'kbd.fg': (getToken) => getToken('control.danger.fg'),
	'kbd.text.shadow': (getToken) => getToken('color.neutral.600'),
	'kbd.bg': (getToken) => getToken('color.neutral.400'),
	'kbd.border': (getToken) => getToken('color.neutral.200'),
	'kbd.shadow': 'rgba(0, 0, 0, 0.3)',
	'kbd.highlight': '#fff',

	// src/common/components/togglebox.scss
	'togglebox.action.hover': (getToken) => adjust(getToken('color.action.300'), 5),
	'togglebox.danger.hover': (getToken) => adjust(getToken('color.danger.300'), 5),

	// src/common/classes/tooltip.scss
	'tooltip.bg': (getToken) => alpha(adjust(getToken('color.base.200'), -10), 0.9),
	'tooltip.fg': (getToken) => getToken('color.neutral.500'),

	// src/common/components/popupTip.scss
	'popuptip.bg': (getToken) => alpha(adjust(getToken('color.base.200'), -10), 0.9),

	// src/common/components/popupPill.scss
	'popuppill.tip.bg': (getToken) => alpha(adjust(getToken('color.base.200'), -10), 0.9),

	// src/common/modules/toaster/toaster.scss
	//
	// It is a module, but since it is also used by hub which doesn't have the
	// Theme module, we register them here.
	'toaster.info.bg': (getToken) => alpha(getToken('color.base.500'), 0.9),
	'toaster.success.bg': (getToken) => alpha(mix(getToken('status.success.bg'), getToken('color.base.200'), 50), 0.9),
	'toaster.success.bg.hover': (getToken) => mix(getToken('status.success.bg'), getToken('color.base.200'), 50),
	'toaster.warn.bg': (getToken) => alpha(adjust(mix(getToken('color.danger.300'), getToken('color.base.200'), 63), -16, -3), 0.9),
	'toaster.warn.bg.hover': (getToken) => adjust(mix(getToken('color.danger.300'), getToken('color.base.200'), 63), -16, -3),
	'toaster.close.bg.hover': (getToken) => alpha(adjust(getToken('color.contrast.300'), 4), 0.06),
	'toaster.shadow': '#000',
};

export default tokens;
