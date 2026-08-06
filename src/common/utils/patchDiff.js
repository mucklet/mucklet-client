/**
 * Performs a LCS matric calculation
 * https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
 * @param {Array} a Before array.
 * @param {Array} b After array.
 * @param {function} onAdd Called on add.
 * @param {function} onRemove  Called on remove.
 */
export default function patchDiff(a, b, onAdd, onRemove) {
	let t, i, j, s = 0, aa, bb, m = a.length, n = b.length;

	// Trim of matches at the start and end
	while (s < m && s < n && a[s] === b[s]) {
		s++;
	}
	if (s === m && s === n) {
		return;
	}
	while (s < m && s < n && a[m - 1] === b[n - 1]) {
		m--;
		n--;
	}

	if (s > 0 || m < a.length) {
		aa = a.slice(s, m);
		m = aa.length;
	} else {
		aa = a;
	}
	if (s > 0 || n < b.length) {
		bb = b.slice(s, n);
		n = bb.length;
	} else {
		bb = b;
	}

	// Create matrix and initialize it
	let c = new Array(m + 1);
	for (i = 0; i <= m; i++) {
		c[i] = t = new Array(n + 1);
		t[0] = 0;
	}
	t = c[0];
	for (j = 1; j <= n; j++) {
		t[j] = 0;
	}

	for (i = 0; i < m; i++) {
		for (j = 0; j < n; j++) {
			c[i + 1][j + 1] = aa[i] === bb[j]
				? c[i][j] + 1
				: Math.max(c[i + 1][j], c[i][j + 1]);
		}
	}

	let idx = m + s;
	i = m;
	j = n;
	let r = 0;
	let adds = [];
	while (true) {
		m = i - 1;
		n = j - 1;
		if (i > 0 && j > 0 && aa[m] === bb[n]) {
			--idx;
			i--;
			j--;
		} else if (j > 0 && (i === 0 || c[i][n] >= c[m][j])) {
			adds.push([ n, idx, r ]);
			j--;
		} else if (i > 0 && (j === 0 || c[i][n] < c[m][j])) {
			onRemove(aa[m], m + s, --idx);
			r++;
			i--;
		} else {
			break;
		}
	}

	// Do the adds
	let len = adds.length - 1;
	for (i = len; i >= 0; i--) {
		[ n, idx, j ] = adds[i];
		onAdd(bb[n], n + s, idx - r + j + len - i);
	}
}
