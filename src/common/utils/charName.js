export default function(fullname) {
	if (!fullname || typeof fullname != 'string') return fullname;
	let i = fullname.indexOf(" ");
	return i < 0 ? fullname : fullname.slice(0, i);
}
