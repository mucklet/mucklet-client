import { RootElem } from 'modapp-base-component';

/**
 * A file select button component.
 */
class FileButton extends RootElem {

	/**
	 * Creates an instance of Button
	 * @param {Component} component Inner component.
	 * @param {function} onSelect Callback function called when a file is selected.
	 * @param {object} [opt] Optional parameters.
	 * @param {string} [opt.tagName] Tag name (eg. 'div') for the element. Defaults to 'button'.
	 * @param {string} [opt.className] Class name
	 * @param {object} [opt.attributes] Key/value attributes object
	 * @param {object} [opt.events] Key/value events object, where the key is the event name, and value is the callback.
	 * @param {object} [opt.asArrayBuffer] Flag telling if the result should be an ArrayBuffer instead of a Data URL.
	 * @param {boolean} [opt.noFileReader] Flag telling if the file should just be returned without reader.
	 */
	constructor(component, onSelect, opt) {
		opt = Object.assign({ tagName: 'button' }, opt);

		super(opt.tagName, opt, [{ component }, { id: 'input', tagName: 'input', properties: { type: "file", style: "display: none;", name: "file" }}]);

		this.component = component;
		this.onSelect = onSelect;
		this.asArrayBuffer = !!opt.asArrayBuffer;
		this.noFileReader = !!opt.noFileReader;
		this.onError = opt.onError || null;

		this.setEvent('click', this._handleClick.bind(this));
		this._rootElem.setNodeEvent('input', 'change', this._handleSelect.bind(this));
	}

	/**
	 * Gets the inner component.
	 * @returns {this}
	 */
	getComponent() {
		return this.component;
	}

	_handleClick(c, ev) {
		let el = this._rootElem.getNode('input');
		el.click();
	}

	_handleSelect(c, ev) {
		let files = ev.target.files;
		if (!files.length) return;

		let file = files[0];
		if (this.noFileReader) {
			this.onSelect(file, null);
			this._clearInput();
			return;
		}
		let reader = new FileReader();
		reader.onload = () => {
			this._clearInput();
			this.onSelect(file, reader.result);
		};
		reader.onerror = ev => {
			this._clearInput();
			if (this.onError) {
				this.onError(ev);
			} else {
				console.error("File load error: ", ev);
			}
		};
		if (this.asArrayBuffer) {
			reader.readAsArrayBuffer(file);
		} else {
			reader.readAsDataURL(file);
		}
	}

	_clearInput() {
		this._rootElem.setNodeProperty('input', 'value', "");
	}
}

export default FileButton;
