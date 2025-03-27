import { StringStream } from '@codemirror/language';
import { offsetCompleteResults } from 'utils/codemirrorTabCompletion';

/**
 * A helper function that creates a match function that can be passed as the match property to CmdPattern.addFieldTyp.
 * It uses a list factory returning a CharList or ItemList.
 * @param {(ctx: import('types/interfaces/CmdCtx').default, opts: any) => ItemList | CharList} getList Get list callback function.
 * @param {(item: any, match: string) => any} prepareValue Prepares the value from the matched item. Item may be null if the list doesn't return an error.
 * @returns {import('types/modules/cmdPattern').FieldType['match']} A field type match function.
 */
export function matchFactory(getList, prepareValue) {
	return (ctx, fieldKey, str, opts, delims, tags, prevValue) => {
		// Trim space
		let len = str.length;
		str = str.trimStart();
		let from = len - str.length;

		// Get list of characters and match
		let list = getList(ctx, opts);
		let stream = new StringStream(str, 0, 0, 0);
		let match = list.consume(stream, ctx);
		if (typeof match != 'string') {
			return null;
		}

		// Get matched item
		let item = list.getItem(match, ctx);
		let err = null;

		if (!item) {
			err = list.errNotFound
				? list.errNotFound(null, match)
				: null;
		} else {
			if (item.error) {
				err = item.error;
			}
		}

		// Add tags
		if (tags) {
			// Did we consume space. Add a null tag.
			if (from > 0) {
				tags.push({ tag: null, n: from });
			}
			// Add tag for the rest of the match
			tags.push({ tag: err ? 'error' : 'listitem', n: match.length });
		}
		// Create value unless we have an error. If we have no item, it
		// means we couldn't do a local lookup, but will let the server
		// check the name.
		let value = err
			? null
			: prepareValue(item, match);
		return {
			from,
			to: from + match.length,
			partial: false,
			value,
			error: err,
		};
	};
}

/**
 * A helper function that creates a match function that can be passed as the complete property to CmdPattern.addFieldTyp.
 * It uses a list factory returning a CharList or ItemList.
 * @param {(ctx: import('types/interfaces/CmdCtx').default, opts: any) => ItemList | CharList} getList Get list callback function.
 * @returns {import('types/modules/cmdPattern').FieldType['complete']} A field type complete function.
 */
export function completeFactory(getList) {
	return (ctx, str, pos, opts) => {
		let list = getList(ctx?.charId, opts);
		let trimmed = str.trimStart();
		let diff = str.length - trimmed.length;
		if (diff > pos) {
			trimmed = str.slice(pos);
			diff = pos;
		}
		return offsetCompleteResults(list.complete(trimmed, pos - diff, ctx), diff);
	};
}
