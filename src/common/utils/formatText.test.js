import { formatTextTokens, modeDescription } from './formatText';

const testCases = [
	// Header
	[ "# Header 1", "<h1>Header 1</h1>" ],
	[ "# Header 1\nFoo", "<h1>Header 1</h1>Foo" ],
	[ "# Header 1\n\nFoo", "<h1>Header 1</h1>Foo" ],
	[ "# Header 1\n\n\nFoo", "<h1>Header 1</h1><br/>Foo" ],
	[ `Foo\n# Header 1`, "Foo<h1>Header 1</h1>" ],
	[ `Foo\n\n# Header 1`, "Foo<h1>Header 1</h1>" ],
	[ `Foo\n\n\n# Header 1`, "Foo<br/><h1>Header 1</h1>" ],
	[ `## ((OOC Header))`, `<h2><span class="ooc">((OOC Header))</span></h2>` ],
	// Table with headers
	[ "Header 1 | Header 2\n--- | ---\nCell 1.1 | _Cell 1.2_", "<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1.1</td><td><em>Cell 1.2</em></td></tr></tbody></table>" ],
	[ "| Header 1 | Header 2\n| --- | ---\n| Cell 1.1 | _Cell 1.2_", "<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1.1</td><td><em>Cell 1.2</em></td></tr></tbody></table>" ],
	[ " | Header 1 | Header 2\n --- | ---\nCell 1.1", "<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1.1</td><td></td></tr></tbody></table>" ],
	[ "Header 1 | Header 2\n --- | ---\nCell 1.1 | Cell 1.2 | Cell 1.3", "<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1.1</td><td>Cell 1.2</td></tr></tbody></table>" ],
	[
		`# Foo

| Header 1 | Header 2
| -------- | --------
| Cell 1.1 | _Cell 1.2_
| Cell 2.1
Cell 3.1 | Cell 3.2

| Bar`,
		"<h1>Foo</h1>" +
		"<table>" +
			"<thead>" +
				"<tr><th>Header 1</th><th>Header 2</th></tr>" +
			"</thead>" +
			"<tbody>" +
				"<tr><td>Cell 1.1</td><td><em>Cell 1.2</em></td></tr>" +
				"<tr><td>Cell 2.1</td><td></td></tr>" +
				"<tr><td>Cell 3.1</td><td>Cell 3.2</td></tr>" +
			"</tbody>" +
		"</table>" +
		"| Bar",
	],
	// Tables without headers
	[ "--- | ---\nFoo | Bar", "<table><tbody><tr><th>Foo</th><td>Bar</td></tr></tbody></table>" ],

	// Code block
	[ "```\nFoo\n```", `<div class="codeblock">Foo</div>` ],
	[ "```\n```", `<div class="codeblock"></div>` ],
	[ "Foo\n```\nBar\n```", `Foo<div class="codeblock">Bar</div>` ],
	[ "Foo\n\n```\nBar\n```", `Foo<div class="codeblock">Bar</div>` ],
	[ "Foo\n\n\n```\nBar\n```", `Foo<br/><div class="codeblock">Bar</div>` ],
	[ "```\nFoo\n```\nBar", `<div class="codeblock">Foo</div>Bar` ],
	[ "```\nFoo\n```\n\nBar", `<div class="codeblock">Foo</div>Bar` ],
	[ "```\nFoo\n```\n\n\nBar", `<div class="codeblock">Foo</div><br/>Bar` ],
	[ "Foo\n\n\n```\nBar\nBaz\n```", `Foo<br/><div class="codeblock">Bar<br/>Baz</div>` ],

	// Escape
	[ "<esc>_Foo_</esc>", "_Foo_" ],
	[ "<esc>`Foo`</esc>", "`Foo`" ],
	[ "<esc>\n_Foo_\n</esc>", "<br/>_Foo_<br/>" ],
	[ "_<esc>**Foo**</esc>_", "<em>**Foo**</em>" ],
	[ "((<esc>((</esc>Foo<esc>))</esc>))", `<span class="ooc">((((Foo))))</span>` ],
	// Escaping inside blocks are not supported yet
	// [ "<esc>\n```\nFoo\n```\n</esc>", "<br/>```<br/>Foo<br/>```<br/>" ],

	// Mix
	[
		`# _These\n| _Header 1_\n| ---`,
		"<h1>_These</h1><table><thead><tr><th><em>Header 1</em></th></tr></thead><tbody></tbody></table>",
	],
	[
		`--- | ---
Foo | <esc>_Baz_</esc>`,
		"<table><tbody><tr><th>Foo</th><td>_Baz_</td></tr></tbody></table>",
	],
	[
		`--- | ---
Foo | ((Bar<esc>))</esc>))`,
		`<table><tbody><tr><th>Foo</th><td><span class="ooc">((Bar))))</span></td></tr></tbody></table>`,
	],
];

describe('formatTextTokens', () => {
	it.each(testCases)('formatTextTokens(`%s`, { mode: modeDescription })', (msg) => {
		expect(formatTextTokens(msg, { mode: modeDescription }).map(t => t.content).join('')).toBe(msg);
	});
});

describe('formatText', () => {
	it.each(testCases)('formatText(`%s`, { mode: modeDescription })', (msg, expected) => {
		expect(formatText(msg, { mode: modeDescription })).toBe(expected);
	});
});
