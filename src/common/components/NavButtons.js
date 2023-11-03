import './navButtons.scss';

export const directions = [ 'n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw' ];

const icons = [
	{ id: 'n', char: 'f062', x: 42.2, y: 21 },
	{ id: 'ne', char: 'f062', x: 42.2, y: 21, rotate: 45 },
	{ id: 'e', char: 'f062', x: 42.2, y: 21, rotate: 90 },
	{ id: 'se', char: 'f062', x: 42.2, y: 21, rotate: 135 },
	{ id: 's', char: 'f062', x: 42.2, y: 21, rotate: 180 },
	{ id: 'sw', char: 'f062', x: 42.2, y: 21, rotate: 225 },
	{ id: 'w', char: 'f062', x: 42.2, y: 21, rotate: 270 },
	{ id: 'nw', char: 'f062', x: 42.2, y: 21, rotate: 315 },
	{ id: 'up', char: 'f08b', x: 44, y: 21.8, rotate: -90 },
	{ id: 'down', char: 'f090', x: 43, y: 21.8, rotate: 90 },
	{ id: 'in', char: 'f090', x: 43, y: 21.8 },
	{ id: 'out', char: 'f08b', x: 44, y: 21.8 },
];

const defaultBtnState = { selected: false, disabled: true, icon: '', title: '' };
const defaultCenterState = { disabled: true, number: 0 };

function setClass(el, className, add) {
	if (add) {
		el.classList.add(className);
	} else {
		el.classList.remove(className);
	}
}

function prepareState(btnState) {
	return btnState
		? {
			selected: !!btnState.selected,
			disabled: !!btnState.disabled,
			icon: btnState.icon || '',
			title: btnState.title || '',
		}
		: defaultBtnState;
}

function prepareCenterState(centerState) {
	return centerState
		? {
			disabled: !!centerState.disabled,
			count: centerState.count || 0,
		}
		: defaultCenterState;
}

/**
 * @typedef {object} NavButtonsBtnState
 * @property {bool} [selected] Flags the button as selected (highlighted).
 * @property {bool} [disabled] Flags the button as disabled.
 * @property {string} [icon] Icon to show on the button.
 * @property {string} [title] Title text for the button.
 */

/**
 * @typedef {object} NavButtonsCenterState
 * @property {number} [count] Flags the button as selected (highlighted).
 * @property {bool} [disabled] Flags the button as disabled.
 * @property {string} [title] Title text for the button.
 */

/**
 * @typedef {{
 * 	n?: NavButtonsBtnState;
 * 	ne?: NavButtonsBtnState;
 * 	e?: NavButtonsBtnState;
 * 	se?: NavButtonsBtnState;
 * 	s?: NavButtonsBtnState;
 * 	sw?: NavButtonsBtnState;
 * 	w?: NavButtonsBtnState;
 * 	nw?: NavButtonsBtnState;
 * 	c?: NavButtonsCenterState;
 * }} NavButtonsState
 */

/**
 * NavButtons is a navigation button.
 */
class NavButtons {

	/**
	 * Creates an instance of NavButtons
	 * @param {object} state Button state object.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Additional class names to append to font-awesome class names.
	 * @param {bool} [opt.shadow] Add a drop shadow to the buttons.
	 * @param {bool} [opt.center] Render a center button.
	 * @param {(dir: string, c: NavButtons) => void} [opt.onClick] Callback called on click
	 */
	constructor(state, opt) {
		this.btns = {};
		this.cbs = null;
		this._onClick = opt?.onClick || null;
		this.center = !!opt?.center;
		this.count = 0;
		// Create element
		this.svg = document.createElement('div');
		this.svg.className = 'navbuttons' + (opt?.className ? ' ' + opt.className : '');

		this.svg.innerHTML = `<svg
	height="100"
	width="100"
	version="1.1"
	xmlns="http://www.w3.org/2000/svg"
	xmlns:svg="http://www.w3.org/2000/svg"${opt?.shadow ? `
	class="shadow"` : ''}>
	<defs>
		<path
			id="btn"
			d="M 50,0 C 44.986273,0.01078937 40.009686,0.77557153 35.235929,2.262753 33.320114,2.8595921 32.431233,4.9719548 33.199296,6.826252 L 44.0625,33.052734 C 45.968389,32.370445 47.975717,32.01454 50,32 c 2.027411,8.64e-4 4.040108,0.344237 5.953125,1.015625 L 66.800728,6.8262622 C 67.568778,4.9719594 66.679886,2.8595919 64.76407,2.2627528 59.990313,0.77557146 55.013727,0.01078937 50,0 Z"
			style="transition: fill-opacity .2s, fill .2s; stroke:none" />
		${icons
		.map(o => `<text
			id="icon-${o.id}"
			x="${o.x}"
			y="${o.y}"
			style="transition: fill-opacity .2s, fill .2s"${o.rotate ? `
			transform="rotate(${o.rotate} 50 16)"` : ''}
		>&#x${o.char};</text>`)
		.join('\n\t\t')}
	</defs>
	${directions.map((dir, i) => `<g class="navbuttons--btn dir-${dir}" transform="rotate(${i * 45} 50 50)" >
	<title></title>
	<use href="#btn"/>
	${icons
		.map(o => `<use class="navbuttons--icon ${o.id}" href="#icon-${o.id}" transform="rotate(${-i * 45} 50 16)" />`)
		.join('\n\t')}
</g>`).join('\n\t')}
	${this.center ? `<g class="navbuttons--btn dir-c">
		<title></title>
		<circle cx="50" cy="50" r="16" style="transition: fill-opacity .2s, fill .2s; stroke:none" />
		${[ ...Array(10) ].map((e, i) => `<text
			class="navbuttons--count count-${i + 1}"
			x="50"
			y="51"
			dominant-baseline="middle"
			text-anchor="middle"
			style="transition: fill-opacity .2s, fill .2s"
		>${i >= 9 ? "9+" : i + 1}</text>`).join('\n\t\t')}
	</g>` : ''}
</svg>`;

		for (let dir of directions) {
			this.btns[dir] = this._getByClass(`dir-${dir}`);
		}
		if (this.center) {
			this.btns['c'] = this._getByClass(`dir-c`);
		}

		this.state = {};
		this.listening = false;
		this.setState(state);
	}

	render(el) {
		this._setListeners(true);
		el.appendChild(this.svg);
		return this.svg;
	}

	unrender() {
		this.svg.parentNode?.removeChild(this.svg);
		this._setListeners(false);
	}

	getElement() {
		return this.svg;
	}

	setButton(id, btnState) {
		btnState = prepareState(btnState);
		this.state[id] = btnState;
		this._updateBtn(id, btnState);
	}

	/**
	 * @param {NavButtonsCenterState} centerState Center state.
	 */
	setCenter(centerState) {
		if (!this.center) {
			return;
		}
		centerState = prepareCenterState(centerState);
		this.state['c'] = centerState;
		this._updateCenter(centerState);
	}

	/**
	 * Sets state
	 * @param {object} state Button state.
	 * @returns {this}
	 */
	setState(state) {
		state = state || {};
		for (let dir of directions) {
			this.state[dir] = prepareState(state[dir]);
		}
		if (this.center) {
			this.state['c'] = prepareCenterState(state['c']);
		}
		this._updateAll();
		return this;
	}

	_setListeners(on) {
		if (this.listening == on) {
			return;
		}
		this.listening = !!on;

		if (this._onClick) {
			if (on) {
				this.cbs = {};
				for (let dir of directions) {
					this._listen(dir);
				}
				if (this.center) {
					this._listen('c');
				}
			} else {
				for (let dir of directions) {
					this._unlisten(dir);
				}
				if (this.center) {
					this._unlisten('c');
				}
				this.cbs = null;
			}
		}
	}

	_listen(dir) {
		let cb = (ev) => {
			this._onClick(dir, this);
			ev.stopPropagation();
		};
		this.btns[dir].addEventListener('click', cb);
		this.cbs[dir] = cb;
	}

	_unlisten(dir) {
		this.btns[dir].removeEventListener('click', this.cbs[dir]);
	}

	_updateAll() {
		for (let dir of directions) {
			this._updateBtn(dir, this.state[dir] || defaultBtnState);
		}
		if (this.center) {
			this._updateCenter(this.state['c'] || defaultCenterState);
		}
	}

	_updateBtn(dir, btnState) {
		let g = this.btns[dir];

		setClass(g, 'disabled', btnState.disabled);
		setClass(g, 'selected', btnState.selected);
		g.firstElementChild.textContent = btnState.title;
		for (let icon of icons) {
			setClass(g, icon.id, btnState.icon == icon.id);
		}
	}

	_updateCenter(centerState) {
		let g = this.btns['c'];
		setClass(g, 'disabled', centerState.disabled);
		g.firstElementChild.textContent = centerState.title;
		let count = centerState.count || 0;
		if (count > 10) {
			count = 10;
		}
		for (let i = 1; i <= 10; i++) {
			setClass(g, `count-${i}`, i == count);
		}
	}


	_getByClass(className) {
		let col = this.svg.getElementsByClassName(className);
		return col.length > 0 ? col[0] : null;
	}
}

export default NavButtons;
