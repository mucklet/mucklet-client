import { formatTextTokens, modeDescription } from './formatText';

const testCases = [
	// Header
	[ "# Header 1", "<h1>Header 1</h1>" ],
	[ "# Header 1\nFoo", "<h1>Header 1</h1>Foo" ],
	[ "# Header 1\n\nFoo", "<h1>Header 1</h1>Foo" ],
	[ "# Header 1\n\n\nFoo", "<h1>Header 1</h1><br/>Foo" ],
	// Table with headers
	[ "Header 1 | Header 2\n--- | ---\nCell 1.1 | _Cell 1.2_", "<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1.1</td><td><em>Cell 1.2</em></td></tr></tbody></table>" ],
	[ "| Header 1 | Header 2\n| --- | ---\n| Cell 1.1 | _Cell 1.2_", "<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1.1</td><td><em>Cell 1.2</em></td></tr></tbody></table>" ],
	[ " | Header 1 | Header 2\n --- | ---\nCell 1.1", "<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead><tbody><tr><td>Cell 1.1</td><td></td></tr></tbody></table>" ],
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
