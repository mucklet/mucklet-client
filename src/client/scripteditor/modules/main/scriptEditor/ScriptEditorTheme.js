import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Using https://github.com/one-dark/vscode-one-dark-theme/ as reference for the colors

const chalky = "#e5c07b",
	coral = "#e06c75",
	cyan = "#56b6c2",
	invalid = "#ffffff",
	ivory = "#abb2bf",
	stone = "#7d8799", // Brightened compared to original to increase contrast
	malibu = "#61afef",
	sage = "#98c379",
	whiskey = "#d19a66",
	violet = "#c678dd",
	darkBackground = "#21252b",
	highlightBackground = "#2c313a",
	background = "#282c34",
	tooltipBackground = "#353a42",
	selection = "#3E4451",
	cursor = "#528bff";

/// The colors used in the theme, as CSS color strings.
export const color = {
	chalky,
	coral,
	cyan,
	invalid,
	ivory,
	stone,
	malibu,
	sage,
	whiskey,
	violet,
	darkBackground,
	highlightBackground,
	background,
	tooltipBackground,
	selection,
	cursor,
};

/// The editor theme styles for One Dark.
export const muckletTheme = EditorView.theme({
	"&": {
		color: ivory,
		backgroundColor: "pink",
	},
	".cm-content": {
		caretColor: cursor,
	},
	".cm-cursor, .cm-dropCursor": {
		borderLeftColor: cursor,
	},
	"&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
		backgroundColor: selection,
	},
	".cm-panels": {
		backgroundColor: darkBackground,
		color: ivory,
	},
	".cm-panels.cm-panels-top": {
		borderBottom: "2px solid black",
	},
	".cm-panels.cm-panels-bottom": {
		borderTop: "2px solid black",
	},
	".cm-searchMatch": {
		backgroundColor: "#72a1ff59",
		outline: "1px solid #457dff",
	},
	".cm-searchMatch.cm-searchMatch-selected": {
		backgroundColor: "#6199ff2f",
	},
	".cm-activeLine": {
		backgroundColor: "#6699ff0b",
	},
	".cm-selectionMatch": {
		backgroundColor: "#aafe661a",
	},
	"&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
		backgroundColor: "#bad0f847",
	},
	// ".cm-gutters": {
	// 	color: stone,
	// 	border: "none",
	// },
	".cm-activeLineGutter": {
		backgroundColor: highlightBackground,
	},
	".cm-foldPlaceholder": {
		backgroundColor: "transparent",
		border: "none",
		color: "#ddd",
	},

	".cm-tooltip": {
		border: "none",
		backgroundColor: tooltipBackground,
	},
	".cm-tooltip .cm-tooltip-arrow:before": {
		borderTopColor: "transparent",
		borderBottomColor: "transparent",
	},
	".cm-tooltip .cm-tooltip-arrow:after": {
		borderTopColor: tooltipBackground,
		borderBottomColor: tooltipBackground,
	},
	".cm-tooltip-autocomplete": {
		"& > ul > li[aria-selected]": {
			backgroundColor: highlightBackground,
			color: ivory,
		},
	},
}, { dark: true });

/// The highlighting style for code in the One Dark theme.
export const muckletHighlightStyle = HighlightStyle.define([
	{
		tag: t.keyword,
		class: 'scripteditor--keyword',
	},
	{
		tag: [ t.name, t.deleted, t.character, t.propertyName, t.macroName ],
		class: 'scripteditor--name',
	},
	{
		tag: [ t.function(t.variableName), t.labelName ],
		class: 'scripteditor--variable',
	},
	{
		tag: [ t.color, t.constant(t.name), t.standard(t.name) ],
		class: 'scripteditor--constant',
	},
	{
		tag: [ t.definition(t.name), t.separator ],
		class: 'scripteditor--separator',
	},
	{
		tag: [ t.typeName, t.className, t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace ],
		class: 'scripteditor--type',
	},
	{
		tag: [ t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string) ],
		class: 'scripteditor--operator',
	},
	{
		tag: [ t.meta, t.comment ],
		class: 'scripteditor--comment',
	},
	{
		tag: t.strong,
		fontWeight: "bold",
	},
	{
		tag: t.emphasis,
		fontStyle: "italic",
	},
	{
		tag: t.strikethrough,
		textDecoration: "line-through",
	},
	{
		tag: t.link,
		class: 'scripteditor--link',
	},
	{
		tag: t.heading,
		class: 'scripteditor--heading',
	},
	{
		tag: [ t.atom, t.bool, t.special(t.variableName) ],
		class: 'scripteditor--bool',
	},
	{
		tag: [ t.processingInstruction, t.string, t.inserted ],
		class: 'scripteditor--string',
	},
	{
		tag: t.invalid,
		class: 'scripteditor--invalid',
	},
]);

/// Extension to enable the One Dark theme (both the editor theme and
/// the highlight style).
export const muckletStyle = [ muckletTheme, syntaxHighlighting(muckletHighlightStyle) ];
