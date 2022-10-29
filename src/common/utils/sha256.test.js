import sha256, { hmacsha256, publicPepper } from './sha256';

describe('sha256', () => {
	it.each([
		[ "", "47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=" ],
		[ "abc", "ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=" ],
		[ "test", "n4bQgYhMfWWaL+qgxVrQFaO/TxsrC4Is0V1sFbDwCgg=" ],
		[ "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq", "JI1qYdIGOLjlwCaTDD5gOaM85Flk/yFn9uzt1BnbBsE=" ],
		[ "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu", "z1sWp3ivg4ADbOWeewSSNwskmxHo8HpRr6xFA3r+6dE=" ],
		[ "rödräv", "75iPlGyUj+5Ruprcuv3ncU9Cg3gwjVEsqyjW96Cgm5E=" ],
	])('sha256(%p) should be %p', (msg, expected) => {
		expect(sha256(msg)).toBe(expected);
	});
});

describe('hmacsha256', () => {
	it.each([
		[ "", publicPepper, "yQzay5zm/Pb9cSgoKujlBvDya1kOvsaPAbH5taJ3fhE=" ],
		[ "abc", publicPepper, "Da3vkxFqmMN2nvBElqL8QmfQVoGk05azsFVQFiKqXbU=" ],
		[ "test", publicPepper, "Qgu0GHt6rbAwNcbeTj11aFmQWyFbJOEXgPkJ0yVUZXw=" ],
		[ "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq", publicPepper, "gI71GUf/7LzWzzIt0f/D0LwkEbac+aVLl1ScpEbn794=" ],
		[ "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu", publicPepper, "KpCYxxyXrtJIJfjlyp9ZDqUmf1aiUR+ljkyCrxRcVMo=" ],
		[ "rödräv", publicPepper, "ddjoPxhpEls2ZXg0Ygu6GjFKaeH4eSViQHwwc74pcBk=" ],
	])('hmacsha256(%p, %p) should be %p', (msg, key, expected) => {
		expect(hmacsha256(msg, key)).toBe(expected);
	});
});
