import normalizeHexColor from './normalizeHexColor';

describe('normalizeHexColor', () => {
	it.each([
		[ '#ABCDEF', '#abcdef' ],
		[ 'abcdef', '#abcdef' ],
		[ '#abcdef12', null ],
		[ '#abc', null ],
	])('normalizes RGB color %p to %p', (color, expected) => {
		expect(normalizeHexColor(color)).toBe(expected);
	});

	it.each([
		[ '#ABCDEF12', '#abcdef12' ],
		[ 'abcdef12', '#abcdef12' ],
		[ '#abcdef', null ],
		[ '#abcdef1234', null ],
		[ '#abcdefgg', null ],
	])('normalizes RGBA color %p to %p', (color, expected) => {
		expect(normalizeHexColor(color, true)).toBe(expected);
	});
});
