export default function(s) {
	if (!s || typeof s != 'string') return s;
	return s.charAt(0).toUpperCase() + s.substr(1);
}
