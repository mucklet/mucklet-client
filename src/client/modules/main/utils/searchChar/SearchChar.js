import SearchCharComponent from "./SearchCharComponent";

/**
 * SearchChar provides an AutoCompleter search component to search for characters.
 */
class SearchChar {
	constructor(app, params) {
		this.app = app;

		this.app.require([
			'player',
			'charsAwake',
		], this._init.bind(this));
	}

	_init(module) {
		this.module = module;
	}

	/**
	 * Creats a new instance of SearchCharComponent. All characters will be search for unless any include option is set.
	 * @param {object} [opt] Optional parameters.
	 * @param {({ id:string, name:string, surname:string }) => void} [opt.onSelect] Called when a character is selected.
	 * @param {boolean} [opt.inRoomChars] Include inRoom chars.
	 * @param {boolean} [opt.ownedChars] Include owned chars.
	 * @param {boolean} [opt.watchedChars] Include watched chars.
	 * @param {boolean} [opt.awakeChars] Include awake chars.
	 * @param {string[]} [opt.excludeChars] List of character ID to exclude.
	 * @param {LocaleString|string} [opt.placeholder] Placeholder text.
	 */
	newSearchChar(opt) {
		return new SearchCharComponent(this.module, opt);
	}
}

export default SearchChar;
