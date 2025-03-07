import type Step from 'types/interfaces/Step';

export interface FieldType {
	/**
	 * ID of the field type
	 */
	id: string;

	/**
	 * Matches a part of a string against the type.
	 * The string may contain leading space.
	 * @returns The from/to position that matches, and if it is only partial, or null if not matched.
	 */
	match(str: string): {from: number, to: number, partial: boolean} | null;

	/**
	 * Step factory function.
	 */
	stepFactory(fieldKey: string, opts: any): Step;

	/**
	 * Input value to be passed to the server.
	 */
	inputValue(fieldKey: string, opts: any, params: any): Promise<any> | any;
}
