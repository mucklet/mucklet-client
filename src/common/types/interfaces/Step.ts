import type { StringStream } from '@codemirror/language';
import type CmdState from 'classes/CmdState';

export default interface Step {

	/**
	 * Sets the next step.
	 */
	setNext(step: Step | null): this;

	/**
	 * Sets the else step.
	 */
	setElse(step: Step | null): this;

	/**
	 * Parses the stream input stream.
	 * @returns The token string to use for the consumed part of the stream, or false if nothing was consumed.
	 */
	parse(stream: StringStream, state: CmdState): (null | string | false);

	/**
	 * Returns options for formatting of text.
	 * @returns Returns an object with a unique ID for the token being
	 * formatted, and other optional parameters as passed to formatText. Null
	 * means no formatting.
	 */
	formatText?(state: CmdState): ({ id: string } | null);
}
