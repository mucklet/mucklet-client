import l10n from 'modapp-l10n';
import Err from 'classes/Err';
import { matchFactory, completeFactory } from 'utils/cmdFieldType';
import firstLetterUppercase from 'utils/firstLetterUppercase';
import ItemList from 'classes/ItemList';
import escapeHtml from 'utils/escapeHtml';
import indexOfChars from 'utils/indexOfChars';


const txtValueIs = l10n.l('cmdFieldTypeList.valueIs', "Value is {value}.");
const txtValueIsOr = l10n.l('cmdFieldTypeList.valueIsOr', "Value is {values} or {lastValue}.");

/**
 * CmdFieldTypeList registers the "list" field type for custom commands.
 */
class CmdFieldTypeList {
	constructor(app) {
		this.app = app;

		// Bind callbacks
		this._getList = this._getList.bind(this);

		this.app.require([
			'cmdPattern',
		], this._init.bind(this));
	}

	_init(module) {
		/**
		 * @type {{
		 * 	cmdPattern: import('modules/main/cmd/cmdPattern/CmdPattern').default,
		 * }}
		 */
		this.module = module;
		this.module.cmdPattern.addFieldType({
			id: 'list',
			match: matchFactory(this._getList, (item, match) => ({ value: item ? item.key : '' })),
			complete: completeFactory(this._getList),
			getDescInfo: (opts, delims) => {
				let items = opts?.items || [];
				if (delims) {
					items = items.filter(v => indexOfChars(v, delims) == -1);
				}
				let len = items.length;
				if (!len) {
					return null;
				}

				let values = items.map(v => `<span class="cmd">${escapeHtml(v)}</span>`);
				if (len == 1) {
					return l10n.t(txtValueIs, { value: values[0] });
				}

				return l10n.t(txtValueIsOr, {
					values: values.slice(0, -1).join(", ") + (len > 2 ? ", " : ''), // Oxford serial comma
					lastValue: values[len - 1],
				});
			},
		});
	}

	_getList(ctx, fieldKey, opts) {
		return new ItemList({
			regex: /^.*/,
			expandRegex: { left: null, right: /[^\s]/ },
			items: opts?.items?.map(v => ({ key: v })) || [],
			errNotFound: (l, m) => new Err('cmdFieldTypeList.itemNotFound', '{fieldKey} has no option called "{match}". See the command help:', { fieldKey: firstLetterUppercase(fieldKey), match: m }),
		});
	}

	dispose() {
		this.module.cmdPattern.removeFieldType('list');
	}
}

export default CmdFieldTypeList;
