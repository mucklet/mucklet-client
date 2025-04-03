/** The result of a complete call */
export interface CompleteResult {
	/** List of words to complete with. */
	list: Array<string>;
	/** Start position of the string part to complete. */
	from: number;
	/** End position of the string part to complete. */
	to: number;
}

/**
 * Gets a list for tab completion.
 * @param str The text string to complete.
 * @param pos The cursor position within the text string.
 * @param ctx Context object as passed to CmdState on creation. (See getCMLanguage in Cmd.js - sets ctx to: { charId })
 * @returns Completion list object, or null if no completion is made.
 */
export type CompleteCallback = (str: string, pos: number, ctx: any, inline?: boolean) => CompleteResult;

export default interface Completer {

	/**
	 * Gets a list for tab completion.
	 * @param str The text string to complete.
	 * @param pos The cursor position within the text string.
	 * @param ctx Context object as passed to CmdState on creation. (See getCMLanguage in Cmd.js - sets ctx to: { charId })
	 * @returns Completion list object, or null if no completion is made.
	 */
	complete: CompleteCallback;
}
