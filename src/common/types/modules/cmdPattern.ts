import type Step from 'types/interfaces/Step';
import type { CompleteResult } from 'types/interfaces/Completer';
import type Err from 'classes/Err';

export interface FieldType {
	/**
	 * ID of the field type
	 */
	id: string;

	/**
	 * Matches a part of a string against the type. The string may contain
	 * leading space.
	 *
	 * If a tokens array is provided, the method should push any token tags used
	 * to style the string together with the number n for how many characters
	 * long that token is. For a list of token tags, see: cmdParser.js
	 * @param str String to match against.
	 * @param opts Field specific options.
	 * @param delims String of delimiters towards adjecent tokens.
	 * @param tokens An array to push token tags into.
	 * @param prevValue Value data returned from previous call where the also result included { more: true }. prevValue must NOT be modified.
	 * @returns The from/to position that matches, and if it is a partial match,
	 * or null if not matched.
	 */
	match(str: string, opts: any, delims: string | null, tokens?: Array<{token: string, n: number}>, prevValue?: any): FieldMatch | null;

	/**
	 *
	 */
	complete?(str: string, pos: number, opts: any): CompleteResult | null

	/**
	 * Step factory function.
	 */
	stepFactory(fieldKey: string, opts: any): Step;

	/**
	 * Input value to be passed to the server.
	 */
	inputValue(fieldKey: string, opts: any, params: any): Promise<any> | any;
}


export interface CmdPattern {
	/** Command ID */
 	id: string;
	/** Command pattern. Eg. "push <Color> [button]" */
	pattern: string;
	/** Command help text. */
	help: string;
	/** Command fields. */
	fields: Record<string, { type: string, desc: string, opts?: any }>;
}

export interface FieldMatch {
	/** Start position of the match. */
	from: number;
	/** End position of the match */
	to: number;
	/** Value for the field */
	value?: any;
	/** Flag to tell if the field only partially matched, but requires more input. */
	partial?: boolean;
	/** Flag to tell if it next line should also be handled by this field. Ignored if to does not go to the end of the line. */
	more?: boolean;
	/** Error to show on attempt to use the command. */
	error?: Err;
}
