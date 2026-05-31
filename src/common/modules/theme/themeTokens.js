import { adjust, alpha, mix } from "utils/color";

/**
 * Standard tokens used my tbe app.
 */
const tokens = {

	// src/common/scss/_variables.scss
	// Color base variants
	'color.base.light': (c) => adjust(c.base, 4),
	'color.base.lighter': (c) => adjust(c.base, 8),
	'color.base.lightest': (c) => adjust(c.base, 14),
	'color.base.dark': (c) => adjust(c.base, -4),
	'color.base.placeholder': (c) => adjust(c.base, 24, -15),
	'color.base.placeholder.light': (c) => adjust(c.base, 34, -15),
	// Color muted variants
	'color.muted.light': (c) => adjust(c.muted, 4),
	'color.muted.lighter': (c) => adjust(c.muted, 8),
	'color.muted.lightest': (c) => adjust(c.muted, 16),
	'color.muted.lightestest': (c) => adjust(c.muted, 20),
	'color.muted.semidark': (c) => adjust(c.muted, -8),
	'color.muted.dark': (c) => adjust(c.muted, -16),
	'color.muted.darker': (c) => adjust(c.muted, -24),
	// Color contrast variants
	'color.contrast.dark': (c) => adjust(c.contrast, -16),
	// Color danger variants
	'color.danger.light': (c) => adjust(c.danger, 6),
	'color.danger.hover': (c) => adjust(c.danger, -8),
	'color.danger.active': (c) => adjust(c.danger, -16),
	// Color action variants
	'color.action.hover': (c) => adjust(c.action, -8),
	'color.action.active': (c) => adjust(c.action, -16),

	// Log colors
	'log.error': (c) => mix(c.danger, c.muted, 70),
	'log.cmd': (c) => c.accent,
	'log.attr': (c) => c.accent,
	'log.listitem': (c) => mix(c.action, c.muted, 50),
	'log.delim': (c) => c.muted,
	'log.text': (c) => adjust(c.muted, 16),
	'log.entityid': (c) => adjust(c.muted, 16),
	'log.bot': (c) => mix(c.action, c.contrast, 80),
	'log.instance': (c) => mix(c.action, c.muted, 60),
	'log.card': (c) => mix(c.accent, c.base, 10),

	// src/common/scss/_badge.scss
	'badge.highlight': (c) => alpha(adjust(c.base, 22, 8), 0.5),
	'badge.highlight.hover': (c) => alpha(adjust(c.base, 19, 8), 0.5),
	'badge.dark.hover': (c) => adjust(c.base, -6),
	'badge.hover': (c) => adjust(c.base, -3),

	// src/common/scss/_common.scss
	'common.level.asleep': (c) => c.muted,
	'common.level.active': (c) => c.contrast,
	'common.level.idle': (c) => c.accent,
	'common.level.inactive': (c) => mix(c.danger, c.accent, 80),
	'common.level.bot': (c) => mix(c.action, c.contrast, 80),

	// src/common/components/autocomplete.scss
	'autocomplete.hover.background': (c) => adjust(c.action, 20),
	'autocomplete.selected.background': (c) => adjust(c.action, 30),

	// src/common/components/navButtons.scss
	'navbuttons.btn.hover.fill': (c) => adjust(c.base, 19),

	// src/common/components/kebabMenu.scss
	'kebabmenu.btn.background': (c) => alpha(c.base, 0.8),

	// src/common/components/togglebox.scss
	'togglebox.action.hover': (c) => adjust(c.action, 5),
	'togglebox.danger.hover': (c) => adjust(c.danger, 5),

	// src/common/classes/tooltip.scss
	'tooltip.background': (c) => alpha(adjust(c.base, -10), 0.9),

	// src/common/components/popupTip.scss
	'popuptip.background': (c) => alpha(adjust(c.base, -10), 0.9),

	// src/common/components/popupPill.scss
	'popuppill.tip.background': (c) => alpha(adjust(c.base, -10), 0.9),

	// src/common/modules/toaster/toaster.scss
	'toaster.info.background': 'rgba(48,55,83,90%)',
	'toaster.success.background': 'rgba(39,67,42,90%)',
	'toaster.warn.background': 'rgba(73,40,28,90%)',
	'toaster.success.background.hover': '#27432a',
	'toaster.warn.background.hover': 'rgba(73,40,28,1)',
	'toaster.close.background.hover': 'rgba(255,255,255,6%)',
};

export default tokens;
