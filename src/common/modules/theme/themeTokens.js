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
	'color.base.500': (getToken) => adjust(getToken('color.base'), 14),

	'color.accent.300': (getToken) => getToken('color.accent'),
	'color.contrast.200': (getToken) => adjust(getToken('color.contrast'), -16),
	'color.contrast.300': (getToken) => getToken('color.contrast'),

	'color.neutral.100': (getToken) => adjust(getToken('color.neutral'), -24),
	'color.neutral.200': (getToken) => adjust(getToken('color.neutral'), -16),
	'color.neutral.250': (getToken) => adjust(getToken('color.neutral'), -8),
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

	'content.default.fg': (getToken) => getToken('color.neutral.300'),
	'content.strong.fg': (getToken) => getToken('color.contrast.300'),
	'content.muted.fg': (getToken) => getToken('color.neutral.200'),
	'content.subtle.fg': (getToken) => getToken('color.neutral.100'),
	'content.error.fg': (getToken) => getToken('color.danger.300'),
	'content.placeholder.fg': (getToken) => adjust(getToken('color.base.200'), 24, -15),
	'control.placeholder.fg': (getToken) => adjust(getToken('color.base.200'), 34, -15),

	'link.default.fg': (getToken) => getToken('color.action.300'),
	'link.default.fg.hover': (getToken) => getToken('color.action.200'),
	'link.default.fg.active': (getToken) => getToken('color.action.100'),
	'focus.ring': (getToken) => getToken('color.accent.300'),

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

	// src/common/scss/_badge.scss
	'badge.highlight': (getToken) => alpha(adjust(getToken('color.base.200'), 22, 8), 0.5),
	'badge.highlight.hover': (getToken) => alpha(adjust(getToken('color.base.200'), 19, 8), 0.5),
	'badge.dark.hover': (getToken) => adjust(getToken('color.base.200'), -6),
	'badge.hover': (getToken) => adjust(getToken('color.base.200'), -3),

	// src/common/components/autocomplete.scss
	'autocomplete.hover.background': (getToken) => adjust(getToken('color.action.300'), 20),
	'autocomplete.selected.background': (getToken) => adjust(getToken('color.action.300'), 30),

	// src/common/components/navButtons.scss
	'navbuttons.btn.hover.fill': (getToken) => adjust(getToken('color.base.200'), 19),

	// src/common/components/kebabMenu.scss
	'kebabmenu.btn.background': (getToken) => alpha(getToken('color.base.200'), 0.8),

	// src/common/components/togglebox.scss
	'togglebox.action.hover': (getToken) => adjust(getToken('color.action.300'), 5),
	'togglebox.danger.hover': (getToken) => adjust(getToken('color.danger.300'), 5),

	// src/common/classes/tooltip.scss
	'tooltip.background': (getToken) => alpha(adjust(getToken('color.base.200'), -10), 0.9),

	// src/common/components/popupTip.scss
	'popuptip.background': (getToken) => alpha(adjust(getToken('color.base.200'), -10), 0.9),

	// src/common/components/popupPill.scss
	'popuppill.tip.background': (getToken) => alpha(adjust(getToken('color.base.200'), -10), 0.9),

	// src/common/modules/toaster/toaster.scss
	'toaster.info.background': (getToken) => alpha(adjust(getToken('color.base.200'), 14), 0.9),
	'toaster.success.background': (getToken) => alpha(adjust(mix(getToken('color.accent.300'), getToken('color.action.300'), 52), -38, 14), 0.9),
	'toaster.warn.background': (getToken) => alpha(adjust(mix(getToken('color.danger.300'), getToken('color.base.200'), 63), -16, -3), 0.9),
	'toaster.success.background.hover': (getToken) => adjust(mix(getToken('color.accent.300'), getToken('color.action.300'), 52), -38, 14),
	'toaster.warn.background.hover': (getToken) => adjust(mix(getToken('color.danger.300'), getToken('color.base.200'), 63), -16, -3),
	'toaster.close.background.hover': (getToken) => alpha(adjust(getToken('color.contrast.300'), 4), 0.06),
};

export default tokens;
