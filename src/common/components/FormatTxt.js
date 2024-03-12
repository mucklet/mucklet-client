import toComponent from 'utils/toComponent.js';
import formatText, { oocNoParenthesis } from 'utils/formatText';
import PanelSection from './PanelSection';
import Fader from './Fader';
import './formatTxt.scss';

function addPart(el, str, className) {
	if (!(str = str.trim())) return;
	let div = document.createElement('div');
	if (className) {
		div.className = className;
	}
	div.innerHTML = formatText(str.trim(), { ooc: oocNoParenthesis });
	el.appendChild(div);
}

/**
 * A file select button component.
 */
class FormatTxt extends Fader {

	/**
	 * Creates an instance of FormatTxt
	 * @param {string} str Text to format
	 * @param {object} [opt] Optional parameters as defined by RootElem.
	 * @param {boolean} [opt.noInteraction] Flag to disable clickable interactions like toggling sections.
	 */
	constructor(str, opt) {
		opt = opt || {};
		opt.className = 'formattxt' + (opt.className ? ' ' + opt.className : '');
		super(null, opt);

		this.state = opt.state || {};
		this.noInteraction = !!opt.noInteraction;
		this.setStr = null;
		this.setFormatText(str);
	}

	getState() {
		return this.state;
	}

	setFormatText(str) {
		str = str || '';

		if (str === this.setStr) return;

		let div = toComponent(document.createElement('div'));
		div.className = 'common--formattext';

		let offset = 0;
		let sectionRegex = /^\[\[(.*?)\]\](?:\s*\{([\s\S]*?)\} *$| *$)/gm;
		let match = sectionRegex.exec(str);
		let next = null;
		let sidx = 0;
		while (match) {
			if (match.index > offset) {
				addPart(div, str.slice(offset, match.index), 'common--sectionpadding');
			}

			next = sectionRegex.exec(str);

			let content = null;
			if (typeof match[2] == 'string') {
				offset = match.index + match[0].length;
				content = match[2];
			} else {
				offset = next ? next.index : str.length;
				content = str.slice(match.index + match[0].length, offset);
			}

			let section = toComponent(document.createElement('div'));
			section.className = 'formattxt--sectioncontent';
			addPart(section, content);
			new PanelSection(match[1], section, {
				open: this.noInteraction ? true : this.state['section_' + sidx] || false,
				className: 'formattxt--section',
				onToggle: this.noInteraction ? null : this._setState.bind(this, sidx),
				noToggle: this.noInteraction,
			}).render(div);
			match = next;
			sidx++;
		}

		if (offset < str.length) {
			addPart(div, str.slice(offset), 'common--sectionpadding');
		}

		this.setStr = str;
		this.setComponent(div);
	}

	_setState(sidx, c, v) {
		this.state['section_' + sidx] = v;
	}
}

export default FormatTxt;
