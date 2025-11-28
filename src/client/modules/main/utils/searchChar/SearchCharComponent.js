import l10n from 'modapp-l10n';
import AutoComplete from 'components/AutoComplete';
import patternMatch, { patternMatchRender, patternMatchCompare } from 'utils/patternMatch';
import mergeCharLists from 'utils/mergeCharLists';

class SearchCharComponent extends AutoComplete {

	/**
	 * Creats a new instance of SearchCharComponent. All characters will be search for unless any include option is set.
	 * @param {object} module Module object.
	 * @param {object} [opt] Optional parameters.
	 * @param {({ id:string, name:string, surname:string }) => void} [opt.onSelect] Called when a character is selected.
	 * @param {boolean} [opt.inRoomChars] Include inRoom chars.
	 * @param {boolean} [opt.ownedChars] Include owned chars.
	 * @param {boolean} [opt.watchedChars] Include watched chars.
	 * @param {boolean} [opt.awakeChars] Include awake chars.
	 * @param {string[]} [opt.excludeChars] List of character ID to exclude.
	 * @param {LocaleString|string} [opt.placeholder] Placeholder text.
	 */
	constructor(module, opt) {
		// Search for all characters unless any specific option is set.
		let allChars = !opt.inRoomChars && !opt.ownedChars && !opt.watchedChars && !opt.awakeChars;

		super({
			...opt,
			className: 'dialog--input dialog--incomplete' + (opt?.className ? ' ' + opt.className : ''),
			attributes: {
				...opt?.attributes,
				placeholder: opt.placeholder
					? typeof opt.placeholder == 'string'
						? opt.placeholder
						: l10n.t(opt.placeholder)
					: l10n.t('searchChar.searchCharacter', "Search for a character"),
				spellcheck: 'false',
			},
			fetch: (text, update, c) => {
				c.addClass('dialog--incomplete');
				let ac = (allChars || opt?.inRoomChars) && module.player.getActiveChar();
				let watchesModel = (allChars || opt?.watchedChars) && module.charsAwake.getWatches();
				let watches = watchesModel
					? Object.keys(watchesModel.props).map(k => watchesModel.props[k]?.char).filter(m => m)
					: null;

				return Promise.resolve(allChars && text.trim().split(/\s+/).length > 1
					? module.player.getPlayer().call('getChar', { charName: text.trim() })
						.catch((err) => err.code == 'core.charNotFound'
							? null
							: Promise.reject(err),
						)
					: null,
				).then(exactChar => {
					let list = mergeCharLists([
						exactChar ? [ exactChar ] : null,
						(allChars || opt?.ownedChars) && module.player.getChars(),
						ac && ac.inRoom.chars,
						(allChars || opt?.awakeChars) && module.charsAwake.getCollection(),
						watches,
					])
						.filter(m => patternMatch((m.name + " " + m.surname).trim(), text) && !opt?.excludeChars?.includes(m.id))
						.map(m => ({ value: m.id, name: m.name, surname: m.surname, label: (m.name + " " + m.surname).trim() }))
						.sort(patternMatchCompare(text, m => m.label))
						.slice(0, 10);
					update(list);
				});
			},
			render: patternMatchRender,
			minLength: 1,
			onSelect: (c, item) => {
				c.removeClass('dialog--incomplete');
				c.setProperty('value', item.label);
				opt?.onSelect?.({ id: item.value, name: item.name, surname: item.surname });
			},
		});
	}
}

export default SearchCharComponent;
