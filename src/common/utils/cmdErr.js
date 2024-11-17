import Err from 'classes/Err';

export function communicationTooLong(step, maxLength) {
	return new Err('cmdErr.communicationTooLong', "The message exceeds the max length of {maxLength} characters.", { maxLength });
}

export function descriptionTooLong(step, maxLength) {
	return new Err('cmdErr.descriptionTooLong', "The description exceeds the max length of {maxLength} characters.", { maxLength });
}

export function shortDescriptionTooLong(step, maxLength) {
	return new Err('cmdErr.shortDescriptionTooLong', "The short description exceeds the max length of {maxLength} characters.", { maxLength });
}

export function itemNameTooLong(step, maxLength) {
	return new Err('cmdErr.itemNameTooLong', "The name exceeds the max length of {maxLength} characters.", { maxLength });
}

export function keyTooLong(step, maxLength) {
	return new Err('cmdErr.keyTooLong', "The key word exceeds the max length of {maxLength} characters.", { maxLength });
}

export function propertyTooLong(step, maxLength) {
	return new Err('cmdErr.propertyTooLong', "The property exceeds the max length of {maxLength} characters.", { maxLength });
}

export function scriptTooLong(step, maxLength) {
	return new Err('cmdErr.scriptTooLong', "The script source code exceeds the max length of {maxLength} characters.", { maxLength });
}
