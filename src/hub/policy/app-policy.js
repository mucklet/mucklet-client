import formatDate from 'utils/formatDate';
import 'scss/index.scss';
import './index.scss';

var elems = document.getElementsByClassName('policy--created');
for (var i = 0; i < elems.length; i++) {
	let el = elems.item(i);
	let created = Number(el.getAttribute('data'));
	if (created) {
		el.textContent = formatDate(new Date(created), { showYear: true });
	}
}
