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

const defaultBtnState = { active: false, disabled: true, icon: '' };

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
		}
		: defaultBtnState;
}

/**
 * @typedef {object} NavButtonsState
* @property {bool} showOwnRoomsInTeleports Flag telling if owned rooms should show up in teleport list.
 */

/**
 * NavButtons is a navigation button.
 */
class NavButtons {

	/**
	 * Creates an instance of NavButtons
	 * @param {object} state Button state.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.className] Additional class names to append to font-awesome class names.
	 * @param {bool} [opt.shadow] Add a drop shadow to the buttons.
	 * @param {(dir: string, c: NavButtons) => void} [opt.onClick] Callback called on click
	 */
	constructor(state, opt) {

		// state = {
		// 	n: { icon: 'up', selected: true },
		// 	w: { icon: 'w' },
		// };

		this.btns = {};
		this.cbs = null;
		this._onClick = opt?.onClick || null;
		// Create element
		this.svg = document.createElement('div');
		this.svg.classList.add('navbuttons' + (opt?.className ? ' opt.className' : ''));

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
			style="transition: fill 0.2s; stroke:none" />
		${icons
		.map(o => `<text
			id="icon-${o.id}"
			x="${o.x}"
			y="${o.y}"
			style="transition: opacity 0.2s, fill 0.2s"${o.rotate ? `
			transform="rotate(${o.rotate} 50 16)"` : ''}
		>&#x${o.char};</text>`)
		.join('\n\t\t')}
	</defs>
	${directions.map((dir, i) => `<g class="navbuttons--btn dir-${dir}" transform="rotate(${i * 45} 50 50)" >
	<use href="#btn"/>
	${icons
		.map(o => `<use class="navbuttons--icon ${o.id}" href="#icon-${o.id}" transform="rotate(${-i * 45} 50 16)" />`)
		.join('\n\t')}
</g>`).join('\n\t')}
	</g>
</svg>`;

		for (let dir of directions) {
			this.btns[dir] = this._getByClass(`dir-${dir}`);
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

	setButton(id, btnState) {
		btnState = prepareState(btnState);
		this.state[id] = btnState;
		this._updateBtn(id, btnState);
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
					let cb = (ev) => {
						this._onClick(dir, this);
						ev.stopPropagation();
					};
					this.btns[dir].addEventListener('click', cb);
					this.cbs[dir] = cb;
				}
			} else {
				for (let dir of directions) {
					this.btns[dir].removeEventListener('click', this.cbs[dir]);
				}
				this.cbs = null;
			}
		}
	}

	_onClick(dir) {

	}

	_updateAll() {
		for (let dir of directions) {
			let btnState = this.state[dir] || defaultBtnState;

			this._updateBtn(dir, btnState);
		}
	}

	_updateBtn(dir, btnState) {
		let g = this.btns[dir];

		setClass(g, 'disabled', btnState.disabled);
		setClass(g, 'selected', btnState.selected);
		for (let icon of icons) {
			setClass(g, icon.id, btnState.icon == icon.id);
		}
	}

	_getByClass(className) {
		let col = this.svg.getElementsByClassName(className);
		return col.length > 0 ? col[0] : null;
	}
}

export default NavButtons;
