import { rgba } from './color';

describe('rgba', () => {
	it.each([
		[ '#123456', 230, '#123456e6' ],
		[ '#abc', 77, '#aabbcc4d' ],
		[ '#abcdef', 0.5, '#abcdef01' ],
		[ '#abcdef', -10, '#abcdef00' ],
		[ '#abcdef', 300, '#abcdefff' ],
	])('rgba(%p, %p) should be %p', (color, alpha, expected) => {
		expect(rgba(color, alpha)).toBe(expected);
	});

	it('returns null for an invalid color', () => {
		expect(rgba('rgba(1, 2, 3, 0.5)', 128)).toBeNull();
	});
});
