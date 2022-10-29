import { StringStream, language } from '@codemirror/language';

/**
 * Iterates over each token in editorState, calling the callback for each.
 * If the callback returns true, that token will be returned, otherwise it
 * will continue to iterate. If no callback is provided, it will return the
 * last token state.
 * @param {EditorState} editorState Codemirror 6 editor state.
 * @param {function} [callback] Callback function returning true if the token is the one: function({ state, token, start, end }) -> boolean
 * @returns {object} Parser state object
 */
export function getToken(editorState, callback) {
	let len = editorState.doc.length;
	let parser = editorState.facet(language).streamParser;
	let state = parser.startState();
	let lineStart = 0;
	let from = 0;
	let to = 0;
	let type = null;

	while (lineStart < len) {
		let line = editorState.doc.lineAt(lineStart);
		if (line.length) {
			let stream = new StringStream(line.text, editorState.tabSize);
			while (stream.pos < line.length) {
				stream.start = stream.pos;
				from = stream.pos + lineStart;
				type = parser.token(stream, state);
				to = stream.pos + lineStart;
				if (callback) {
					let result = { type, state, from, to };
					if (callback(result)) {
						return result;
					}
				}
			}
		} else {
			parser.blankLine(state);
		}
		lineStart = line.to + 1;
	}

	return { type, state, from, to };
}
