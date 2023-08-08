import escapeHtml from './escapeHtml.js';

const defaultOpt = {};

function keySort(a, b) {
	return a.key.localeCompare(b.key);
}

/**
 * Formats a string, escapes it and formats it so that _this_ becomes italic and
 * **that** becomes bold.
 * @param {string} str Text to format.
 * @param {object} [opt] Optional parameters
 * @param {Array.<object>} [opt.triggers] Array of trigger objects
 * @param {object} [opt.em] Token object for em.
 * @param {object} [opt.strong] Token object for strong.
 * @param {object} [opt.ooc] Token object for ooc
 * @param {object} [opt.cmd] Token object for cmd
 * @param {object} [opt.sup] Token object for sup
 * @param {object} [opt.sub] Token object for sub
 * @returns {string} HTML formatted string.
 */
export default function formatText(str, opt) {
	let tokens = [{
		type: 'text',
		content: str,
		level: 0,
	}];

	parseTokens(tokens, opt);

	return tokens.map(t => t.content).join('');
}

/**
 * Formats a string, escapes it and formats it so that _this_ becomes italic and
 * **that** becomes bold.
 * @param {string} str Text to format.
 * @param {object} [opt] Optional parameters
 * @returns {Array.<object>}  HTML formatted string.
 */
export function formatTextTokens(str, opt) {
	let tokens = [{
		type: 'text',
		content: str,
		level: 0,
	}];

	parseTokens(tokens, opt, true);

	return tokens;
	// return tokens.map(t => t.content).join('');
}

/**
 * Filter trigger arrays to only contain triggers existing in the text.
 * @param {string} str Text to scan for triggers.
 * @param {Array.<object>} triggers Array of trigger objects
 * @returns {?Array.<object>} Array of triggers existing in the text. Or null if no triggers matches.
 */
export function filterTriggers(str, triggers) {
	if (!triggers || !triggers.length) {
		return null;
	}

	let tokens = [{
		type: 'text',
		content: str,
		level: 0,
	}];

	triggers.sort(keySort);
	parseTokens(tokens, { triggers });
	let foundTriggers = {};
	tokens.filter(t => t.type == 'highlight_start').forEach(t => foundTriggers[t.trigger.key] = t.trigger);
	let keys = Object.keys(foundTriggers);
	if (!keys.length) {
		return null;
	}

	triggers = keys.map(k => foundTriggers[k]);
	triggers.sort(keySort);

	return triggers;
}

/**
 * Get the first trigger word.
 * @param {string} str Text to scan for triggers.
 * @param {Array.<object>} triggers Array of trigger objects
 * @returns {string} First text matching a trigger.
 */
export function firstTriggerWord(str, triggers) {
	if (!triggers || !triggers.length) {
		return "";
	}

	let tokens = [{
		type: 'text',
		content: str,
		level: 0,
	}];

	triggers.sort(keySort);
	parseTokens(tokens, { triggers });

	for (let t of tokens) {
		if (t.type == 'highlight_static') {
			return t.orig;
		}
	}
	return "";
}

const token_cmd_start = { type: 'cmd_start', content: '<span class="cmd">' };
const token_cmd_end = { type: 'cmd_end', content: '</span>' };
const token_em_start = { type: 'em_start', content: '<em>' };
const token_em_end = { type: 'em_end', content: '</em>' };
const token_strong_start = { type: 'strong_start', content: '<strong>' };
const token_strong_end = { type: 'strong_end', content: '</strong>' };
const token_ooc_start = { type: 'ooc_start', content: '<span class="ooc">((' };
const token_ooc_end = { type: 'ooc_end', content: '))</span>' };
const token_ooc_start_noparenthesis = { type: 'ooc_start', content: '<span class="ooc">' };
const token_ooc_end_noparenthesis = { type: 'ooc_end', content: '</span>' };
const token_sup_start = { type: 'sup_start', content: '<sup>' };
const token_sup_end = { type: 'sup_end', content: '</sup>' };
const token_sub_start = { type: 'sub_start', content: '<sub>' };
const token_sub_end = { type: 'sub_end', content: '</sub>' };
const token_strikethrough_start = { type: 'strikethrough_start', content: '<s>' };
const token_strikethrough_end = { type: 'strikethrough_end', content: '</s>' };
const token_br = { type: 'br', content: '<br/>' };
const token_highlight_start = { type: 'highlight_start', content: '<span class="highlight">' };
const token_highlight_end = { type: 'highlight_end', content: '</span>' };

export const oocNoParenthesis = { start: token_ooc_start_noparenthesis, end: token_ooc_end_noparenthesis };

const rules = [
	// Cmd
	textStyle(/(?=^|[^\w])`/m, /`(?=$|[^\w])/m, (m, opt) => opt.cmd && opt.cmd.start || token_cmd_start, (m, opt) => opt.cmd && opt.cmd.end || token_cmd_end, {
		crossToken: false,
		processInner: (t, keepContent) => t.type == 'text'
			? { type: 'static', content: keepContent ? t.content : escapeHtml(t.content) }
			: t,
	}),
	// Formatted links
	formattedLinks,
	// Inline links
	inlineLinks,
	// Em
	textStyle(/\b_/m, /_\b/m, (m, opt) => opt.em && opt.em.start || token_em_start, (m, opt) => opt.em && opt.em.end || token_em_end),
	// Strong
	textStyle(/(?=^|[^\w])\*\*/m, /\*\*(?=$|[^\w])/m, (m, opt) => opt.strong && opt.strong.start || token_strong_start, (m, opt) => opt.strong && opt.strong.end || token_strong_end),
	// Strikethrough
	textStyle(/(?=^|[^\w])~~/m, /~~(?=$|[^\w])/m, (m, opt) => opt.strikethrough && opt.strikethrough.start || token_strikethrough_start, (m, opt) => opt.strikethrough && opt.strikethrough.end || token_strikethrough_end),
	// OOC
	textStyle(/(?=^|[^\w])\(\(/m, /\)\)(?=$|[^\w])/m, (m, opt) => opt.ooc && opt.ooc.start || token_ooc_start, (m, opt) => opt.ooc && opt.ooc.end || token_ooc_end),
	// Superscript
	textStyle(/\+\+/m, /\+\+/m, (m, opt) => opt.sup && opt.sup.start || token_sup_start, (m, opt) => opt.sup && opt.sup.end || token_sup_end),
	// Subscript
	textStyle(/--/m, /--/m, (m, opt) => opt.sub && opt.sub.start || token_sub_start, (m, opt) => opt.sub && opt.sub.end || token_sub_end),
	// Triggers
	triggers,
	// Line breaks
	textReplace(/\n/m, (m, opt) => token_br),
	// Escape HTML characters
	escape,
];

function parseTokens(tokens, opt, keepContent) {
	opt = opt || defaultOpt;
	for (let rule of rules) {
		rule(tokens, opt, keepContent);
	}
}

function findInTokens(tokens, re, opts) {
	let { idx, pos, crossBoundary, crossToken, level } = Object.assign({ idx: 0, pos: 0, crossBoundary: true, crossToken: true, level: null }, opts);

	for (let i = idx, l = tokens.length; i < l; i++) {
		let token = tokens[i];
		if (token.type == 'text') {
			if (level != null && token.level < level) {
				return null;
			}
			if (level == null || token.level == level) {
				let match = matchTextToken(token, re, pos);
				if (match) {
					return { match, offset: pos, idx: i, token };
				}
			}
		} else {
			if (token.boundary && !crossBoundary) {
				return null;
			}
		}
		pos = 0;
		if (!crossToken) {
			return null;
		}
	}
	return null;
}

function matchTextToken(token, re, pos) {
	let content = pos ? token.content.slice(pos) : token.content;
	return content ? content.match(re) : null;
}

function matchOffset(m, atStart) {
	return atStart
		? m.offset + m.match.index
		: m.offset + m.match.index + m.match[0].length;
}

function textStyle(startRegex, endRegex, startToken, endToken, config) {
	let { crossToken, processInner } = Object.assign({ crossToken: true }, config);
	return function(tokens, opt, keepContent) {
		let idx = 0;
		let pos = 0;
		while (idx < tokens.length) {
			// Try to find emphasis start
			let start = findInTokens(tokens, startRegex, { idx, pos });
			if (!start) {
				return;
			}

			// Try to find emphasis end
			let offset = matchOffset(start);
			let end = findInTokens(tokens, endRegex, { idx: start.idx, pos: offset + 1, level: start.token.level, crossBoundary: false, crossToken });
			if (!end) {
				idx = start.idx;
				pos = offset;
				continue;
			}

			// Found emphasis
			spliceTextTokens(
				tokens,
				{ idx: start.idx, from: matchOffset(start, true), to: matchOffset(start) },
				{ idx: end.idx, from: matchOffset(end, true), to: matchOffset(end) },
				startToken(start, opt),
				endToken(end, opt),
				keepContent,
				processInner,
			);
			idx = end.idx;
			pos = matchOffset(end);
		}
	};
}

function textReplace(regex, tokenFactory) {
	return function(tokens, opt, keepContent) {
		let idx = 0;
		let pos = 0;
		while (idx < tokens.length) {
			let m = findInTokens(tokens, regex, { idx, pos });
			if (!m) {
				return;
			}

			spliceTextToken(tokens, m.idx, matchOffset(m, true), matchOffset(m), tokenFactory(m, opt), keepContent);

			idx = m.idx;
			pos = matchOffset(m);
		}
	};
}

function escape(tokens, keepContent) {
	if (!keepContent) {
		for (let t of tokens) {
			if (t.type == 'text') {
				t.raw = t.content;
				t.content = escapeHtml(t.content);
			}
		}
	}
}

const regexIsLetter = /\p{L}/u;

export function isBoundary(s, idx) {
	if (idx == 0 || idx >= s.length) return true;

	return !s.slice(idx - 1, idx).match(regexIsLetter) || !s.slice(idx, idx + 1).match(regexIsLetter);
}


function triggers(tokens, opt, keepContent) {
	let triggers = opt.triggers;
	if (!triggers || !triggers.length) {
		return;
	}

	let idx = 0;
	while (idx < tokens.length) {
		let token = tokens[idx];
		if (token.type == 'text') {
			let str = tokens[idx].content.toLowerCase();
			// Try to find emphasis start
			for (let i = triggers.length - 1; i >= 0; i--) {
				let trigger = triggers[i];
				if (trigger && typeof trigger == 'object' && trigger.key) {
					let triggerLength = trigger.key.length;

					let txtIdx = str.indexOf(trigger.key);
					if (txtIdx >= 0 && isBoundary(str, txtIdx) && isBoundary(str, txtIdx + triggerLength)) {
						spliceTextToken(tokens, idx, txtIdx + triggerLength, txtIdx + triggerLength, token_highlight_end, keepContent);
						spliceTextToken(tokens, idx, txtIdx, txtIdx, Object.assign({ trigger }, token_highlight_start), keepContent);
						let t = tokens[idx + 2];
						t.type = 'highlight_static';
						if (!keepContent) {
							t.content = escapeHtml(t.content);
						}
						t.orig = t.content;
						t.level++;
						str = str.slice(0, txtIdx);
					}
				}
			}
		}
		idx++;
	}
}


function spliceTextTokens(tokens, start, end, startToken, endToken, keepContent, processInner) {
	spliceTextToken(tokens, end.idx, end.from, end.to, endToken, keepContent);
	spliceTextToken(tokens, start.idx, start.from, start.to, startToken, keepContent);

	// Increase level for inbetween text tokens
	let sidx = start.idx + 1;
	let eidx = end.idx + 3;
	for (let i = sidx, e = eidx; i < e; i++) {
		let t = tokens[i];
		if (t.type == 'text') {
			t.level++;
		}
		if (processInner && i != sidx && i != eidx) {
			tokens[i] = processInner(t, keepContent) || t;
		}
	}
}

/**
 * Splices in a single token within an existing text token.
 * It may produce empty text tokens
 * @param {Array.<object>} tokens Tokens array.
 * @param {number} idx Index of token to splice into.
 * @param {number} start Start index position
 * @param {number} end End index position
 * @param {object} token Token object to splice in.
 * @param {boolean} keepContent Flag telling to keep raw content intact.
 */
function spliceTextToken(tokens, idx, start, end, token, keepContent) {
	let t = tokens[idx];
	tokens.splice(idx, 1,
		{
			type: 'text',
			content: t.content.slice(0, start),
			level: t.level,
		},
		keepContent ? Object.assign({}, token, { content: t.content.slice(start, end) }) : token,
		{
			type: 'text',
			content: t.content.slice(end),
			level: t.level,
		},
	);
}

function formattedLinks(tokens, opt, keepContent) {
	let idx = 0;
	let pos = 0;
	while (idx < tokens.length) {
		let start = findInTokens(tokens, /\[(.+?)\]\(/m, { idx, pos });
		if (!start) {
			return;
		}

		let token = tokens[start.idx];

		let link = findLinkInToken(token, matchOffset(start), true);
		if (!link) {
			idx = start.idx;
			pos = matchOffset(start);
			continue;
		}

		let end = matchTextToken(token, /^\)/, link.offset + link.url.length);
		if (!end) {
			idx = start.idx;
			pos = link.offset + link.url.length;
			continue;
		}

		if (keepContent) {
			let linkFrom = matchOffset(start) - 1;
			let linkTo = link.offset + link.url.length + end.index + end[0].length;
			let anchorFrom = matchOffset(start, true);
			spliceTextTokens(
				tokens,
				{ idx: start.idx, from: linkFrom, to: linkFrom + 1 },
				{ idx: start.idx, from: linkTo - end[0].length, to: linkTo },
				{ type: 'link_start' },
				{ type: 'link_end' },
				true,
				t => { t.type = 'link'; },
			);
			spliceTextTokens(
				tokens,
				{ idx: start.idx, from: anchorFrom, to: anchorFrom + 1 },
				{ idx: start.idx, from: linkFrom - 1, to: linkFrom },
				{ type: 'anchor_start' },
				{ type: 'anchor_end' },
				true,
				t => { t.type = 'anchor'; },
			);
			idx = start.idx + 7;
		} else {
			let escapedUrl = escapeHtml(link.url);
			spliceTextToken(tokens, start.idx, matchOffset(start, true), link.offset + link.url.length + end.index + end[0].length, {
				type: 'anchor',
				content: '<a href="' + escapedUrl + '" target="_blank" rel="noopener noreferrer" title="' + escapedUrl + '">' + escapeHtml(start.match[1]) + '</a>',
			}, keepContent);
			idx = start.idx + 2;
		}
		pos = 0;
	}
}

function inlineLinks(tokens, opt, keepContent) {
	let idx = 0;
	let pos = 0;
	while (idx < tokens.length) {
		let token = tokens[idx];
		if (token.type == 'text') {
			let link = findLinkInToken(token, pos, false, true);
			if (link) {
				let escapedUrl = escapeHtml(link.url);
				spliceTextToken(tokens, idx, link.offset, link.offset + link.url.length, {
					type: 'anchor',
					content: '<a href="' + escapedUrl + '" target="_blank" rel="noopener noreferrer" title="' + escapedUrl + '">' + escapedUrl + '</a>',
				}, keepContent);
				idx += 2;
				pos = 0;
				continue;
			}
		}
		idx++;
		pos = 0;
	}
}

function findLinkInToken(token, pos, requireFirst, trimEnd) {
	let content = pos ? token.content.slice(pos) : token.content;

	// Require scheme
	let scheme = content.match(requireFirst ? /^https?:\/\// : /\bhttps?:\/\//);
	if (!scheme) {
		return null;
	}

	content = content.slice(scheme.index + scheme[0].length);

	let domain = content.match(/^[^\s/$.?#()].[^\s/())]*/);
	if (!domain) {
		return null;
	}

	content = content.slice(domain[0].length);
	let i = 0;
	let l = content.length;
	let level = 0;
	// [TODO] Make this more clever to allow things like:
	// :shows [https://example.com/test] and similar
	while (i < l) {
		let c = content.charCodeAt(i);
		// Space or control character
		if (c <= 0x20 || c == 0x7F) {
			break;
		}
		if (c === 0x28 /* ( */) {
			level++;
		} else if (c === 0x29 /* ) */) {
			if (!level) break;
			level--;
		}
		i++;
	}

	let path = content.slice(0, i);
	// trim assumed non-related characters at the end
	if (trimEnd) {
		let m = path.match(/[.!?:;\-"']+$/);
		if (m) {
			path = path.slice(0, m.index);
		}
	}

	return {
		offset: pos + scheme.index,
		scheme: scheme[0],
		domain: domain[0],
		path,
		url: scheme[0] + domain[0] + path,
	};
}
