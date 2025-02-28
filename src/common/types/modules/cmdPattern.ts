import type Step from 'types/interfaces/Step';

export interface FieldType {
	/**
	 * ID of the field type
	 */
	id: string;

	/**
	 * Matches a part of a string against the type.
	 * The string may contain leading space.
	 * @returns The remaining (non-consumed) part of the string on match, or null if not matched.
	 */
	match(str: string): (string | null);

	/**
	 * Step factory function.
	 */
	stepFactory(fieldKey: string, opts: any): Step;
}
