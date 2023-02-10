import {
	appendCharName,
	appendPoseSpacing,
	appendFormatText,
	appendTag,
	toComponent,
} from './charLogUtils';

// Msg event (for any type of pose like character event)
export function msgEvent(charId, ev, isComm) {
	let div = document.createElement('div');
	appendCharName(div, ev.char);
	let textSpan = div;
	if (isComm) {
		div.className = 'charlog--highlight';
		textSpan = document.createElement('span');
		textSpan.className = 'charlog--comm';
		div.appendChild(textSpan);
	}
	appendPoseSpacing(textSpan, ev.msg);
	appendFormatText(textSpan, ev.msg, ev.mod);
	return toComponent(div, isComm);
}

// Say event
export function sayEvent(charId, ev, isComm) {
	let div = document.createElement('div');
	appendCharName(div, ev.char);
	let textSpan = div;
	if (isComm) {
		div.className = 'charlog--highlight';
		textSpan = document.createElement('span');
		textSpan.className = 'charlog--comm';
		div.appendChild(textSpan);
	}
	textSpan.appendChild(document.createTextNode(' says, "'));
	appendFormatText(textSpan, ev.msg, ev.mod);
	textSpan.appendChild(document.createTextNode('"'));
	return toComponent(div, isComm);
}


// Msg event for events with a method
export function methodMsgEvent(charId, ev, method) {
	let div = document.createElement('div');
	appendCharName(div, ev.char);
	if (method) {
		appendTag(div, " " + method);
	}
	appendPoseSpacing(div, ev.msg);
	appendFormatText(div, ev.msg, ev.mod);
	return toComponent(div);
}


// Travel event
export function travelEvent(charId, ev) {
	let div = document.createElement('div');
	methodMsgEvent(charId, ev, ev.method).render(div);

	let rdiv = document.createElement('div');
	let t = ev.targetRoom;
	rdiv.className = 'ev-travel--room';
	rdiv.textContent = t && t.name;
	div.appendChild(rdiv);

	return toComponent(div);
}

// // Follow event
// export function followEvent(charId, ev) {
// 	let div = document.createElement('div');
// 	appendCharName(div, ev.char);
// 	div.appendChild(document.createTextNode(' starts to follow '));
// 	appendCharName(div, ev.target);
// 	div.appendChild(document.createTextNode('.'));
// 	return toComponent(div);
// }

// Stop follow event
export function stopFollowEvent(charId, ev) {
	let fieldset = document.createElement('div');
	fieldset.className = 'charlog--fieldset';
	let fieldsetSpan = document.createElement('span');
	fieldsetSpan.appendChild(document.createTextNode("Stop follow"));
	let fieldsetLabel = document.createElement('div');
	fieldsetLabel.className = 'charlog--fieldset-label';
	fieldsetLabel.appendChild(fieldsetSpan);
	fieldset.appendChild(fieldsetLabel);
	appendCharName(fieldset, ev.char);
	fieldset.appendChild(document.createTextNode(' stops following '));
	appendCharName(fieldset, ev.target);
	fieldset.appendChild(document.createTextNode('.'));
	let div = document.createElement('div');
	div.appendChild(fieldset);
	return toComponent(div);
}

// Stop lead event
export function stopLeadEvent(charId, ev) {
	let fieldset = document.createElement('div');
	fieldset.className = 'charlog--fieldset';
	let fieldsetSpan = document.createElement('span');
	fieldsetSpan.appendChild(document.createTextNode("Stop lead"));
	let fieldsetLabel = document.createElement('div');
	fieldsetLabel.className = 'charlog--fieldset-label';
	fieldsetLabel.appendChild(fieldsetSpan);
	fieldset.appendChild(fieldsetLabel);
	appendCharName(fieldset, ev.char);
	fieldset.appendChild(document.createTextNode(' stops leading '));
	appendCharName(fieldset, ev.target);
	fieldset.appendChild(document.createTextNode('.'));
	let div = document.createElement('div');
	div.appendChild(fieldset);
	return toComponent(div);
}

