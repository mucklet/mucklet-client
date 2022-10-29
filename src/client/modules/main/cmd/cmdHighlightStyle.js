import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

export const highlightStyle = HighlightStyle.define([
	{ tag: t.invalid, class: 'console--error' },
	{ tag: t.attributeValue, class: 'console--listitem' },
	{ tag: t.string, class: 'console--text' },
	{ tag: t.operator, class: 'console--delim' },
	{ tag: t.name, class: 'console--cmd' },
	{ tag: t.propertyName, class: 'console--attr' },
	{ tag: t.comment, class: 'console--unknown' },
	{ tag: t.keyword, class: 'console--entityid' },
]);

export default syntaxHighlighting(highlightStyle);
