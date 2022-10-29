export function communicationTooLong(step, maxLength) {
	return { code: 'cmdErr.communicationTooLong', message: "The message exceeds the max length of {maxLength} characters.", data: { maxLength }};
}

export function descriptionTooLong(step, maxLength) {
	return { code: 'cmdErr.descriptionTooLong', message: "The description exceeds the max length of {maxLength} characters.", data: { maxLength }};
}

export function shortDescriptionTooLong(step, maxLength) {
	return { code: 'cmdErr.shortDescriptionTooLong', message: "The short description exceeds the max length of {maxLength} characters.", data: { maxLength }};
}

export function itemNameTooLong(step, maxLength) {
	return { code: 'cmdErr.itemNameTooLong', message: "The name exceeds the max length of {maxLength} characters.", data: { maxLength }};
}

export function keyTooLong(step, maxLength) {
	return { code: 'cmdErr.keyTooLong', message: "The key word exceeds the max length of {maxLength} characters.", data: { maxLength }};
}

export function propertyTooLong(step, maxLength) {
	return { code: 'cmdErr.propertyTooLong', message: "The property exceeds the max length of {maxLength} characters.", data: { maxLength }};
}
