import ImgModal from 'classes/ImgModal';
import 'scss/index.scss';
import './style.scss';


// Turn all styleguide-screenshot links into modals.
document.addEventListener('DOMContentLoaded', () => {
	function onClickImg(url, ev) {
		ev.preventDefault();
		new ImgModal(url).open();
	}

	let links = document.getElementsByClassName('styleguide-screenshot');
	for (let l of links) {
		let href = l.getAttribute('href');
		l.setAttribute('href', 'javascript:;');
		l.addEventListener('click', (ev) => onClickImg(href, ev));
	}
}, false);
