import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

export const highlightStyle = HighlightStyle.define([
	{ tag: t.invalid, class: 'cmd--error' },
	{ tag: t.attributeValue, class: 'cmd--listitem' },
	{ tag: t.string, class: 'cmd--text' },
	{ tag: t.operator, class: 'cmd--delim' },
	{ tag: t.name, class: 'cmd--cmd' },
	{ tag: t.propertyName, class: 'cmd--attr' },
	{ tag: t.comment, class: 'cmd--unknown' },
	{ tag: t.keyword, class: 'cmd--entityid' },
	{ tag: t.meta, class: 'cmd--ooc' },
	{ tag: t.macroName, class: 'cmd--code' },
]);

export default syntaxHighlighting(highlightStyle);
