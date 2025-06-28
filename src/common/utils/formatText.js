import escapeHtml from './escapeHtml.js';

const defaultOpt = {};

function keySort(a, b) {
	return a.key.localeCompare(b.key);
}

const typeText = 'text';
const typeBr = 'br';

/**
 * Token a token produced by the parser.
 * The text "**YES!**" could produce the tokens:
 *    [
 *      new Token('strong_start', '<strong>'),
 *      new Token('text', 'YES!', 1),
 *      new Token('strong_end', '</strong>'),
 *    ]
 */
class Token {
	/**
	 * Creates a new Token instance.
	 * @param {string} type Token type.
	 * @param {string} content Content that would be the output for this token.
	 * @param {number} [level] Level of wrapping/applied formats for 'text' tokens. Eg. <em>level 1<strong>level 2</strong></em>. Defaults to null.
	 */
	constructor(type, content, level = null) {
		this.type = type,
		this.content = content;
		this.level = level;
	}
}

/**
 * A regexp match within the content of a token.
 * @typedef {object} TokenMatch
 * @property {RegExpMatchArray} match Regexp match array.
 * @property {number} offset Offset within the token content from where the match was made.
 * @property {number} idx Token index.
 * @property {Token} token Token object
 */

global.formatText = formatText;
global.formatTextTokens = formatTextTokens;

// Rendering modes.
export const modeDescription = "description";

/**
 * Formats a string, escapes it and formats it so that _this_ becomes italic and
 * **that** becomes bold.
 * @param {string} str Text to format.
 * @param {object} [opt] Optional parameters
 * @param {"default" | "description"} [opt.mode] Rendering mode. Defaults to "default".
 * @param {Array.<object>} [opt.triggers] Array of trigger objects
 * @param {object} [opt.em] Token object for em.
 * @param {object} [opt.strong] Token object for strong.
 * @param {object} [opt.ooc] Token object for ooc
 * @param {object} [opt.cmd] Token object for cmd
 * @param {object} [opt.sup] Token object for sup
 * @param {object} [opt.sub] Token object for sub
 * @param {object} [opt.strikethrough] Token object for strikethrough
 * @returns {string} HTML formatted string.
 */
export default function formatText(str, opt) {
	let tokens = [ new Token(typeText, str, 0) ];

	parseTokens(tokens, opt);

	return tokens.map(t => t.content).join('');
}

/**
 * Formats a string, escapes it and formats it so that _this_ becomes italic and
 * **that** becomes bold.
 * @param {string} str Text to format.
 * @param {object} [opt] Optional parameters
 * @param {boolean} [keepContent] Flag to keep content instead of turning it into tags.
 * @returns {Array.<Token>} Array of Tokens.
 */
export function formatTextTokens(str, opt, keepContent = true) {
	let tokens = [ new Token(typeText, str, 0) ];

	parseTokens(tokens, opt, keepContent);

	return tokens;
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

	let tokens = [ new Token(typeText, str, 0) ];

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

	let tokens = [ new Token(typeText, str, 0) ];

	triggers.sort(keySort);
	parseTokens(tokens, { triggers }, true);

	for (let t of tokens) {
		if (t.type == 'highlight_static') {
			return t.content;
		}
	}
	return "";
}

const token_cmd_start = new Token('cmd_start', '<span class="cmd">');
const token_cmd_end = new Token('cmd_end', '</span>');
const token_em_start = new Token('em_start', '<em>');
const token_em_end = new Token('em_end', '</em>');
const token_strong_start = new Token('strong_start', '<strong>');
const token_strong_end = new Token('strong_end', '</strong>');
const token_ooc_start = new Token('ooc_start', '<span class="ooc">((');
const token_ooc_end = new Token('ooc_end', '))</span>');
const token_ooc_start_noparenthesis = new Token('ooc_start', '<span class="ooc">');
const token_ooc_end_noparenthesis = new Token('ooc_end', '</span>');
const token_sup_start = new Token('sup_start', '<sup>');
const token_sup_end = new Token('sup_end', '</sup>');
const token_sub_start = new Token('sub_start', '<sub>');
const token_sub_end = new Token('sub_end', '</sub>');
const token_strikethrough_start = new Token('strikethrough_start', '<s>');
const token_strikethrough_end = new Token('strikethrough_end', '</s>');
const token_br = new Token(typeBr, '<br/>');
const token_highlight_start = new Token('highlight_start', '<span class="highlight">');
const token_highlight_end = new Token('highlight_end', '</span>');
const token_h1_start = new Token('h1_start', '<h1>');
const token_h1_end = new Token('h1_end', '</h1>');
const token_h2_start = new Token('h2_start', '<h2>');
const token_h2_end = new Token('h2_end', '</h2>');
const token_h3_start = new Token('h3_start', '<h3>');
const token_h3_end = new Token('h3_end', '</h3>');

export const oocNoParenthesis = { start: token_ooc_start_noparenthesis, end: token_ooc_end_noparenthesis };

const rules = [
	// Line breaks
	textReplace(/\n/m, (m, opt) => token_br),
	// Blocks (see blockRules)
	transformBlocks,
	// Cmd
	textStyle(/(?=^|[^\w])`/m, /`(?=$|[^\w])/m, opt => opt.cmd && opt.cmd.start || token_cmd_start, opt => opt.cmd && opt.cmd.end || token_cmd_end, {
		validToken: token => token.type == typeText || token.type == typeBr,
		processInner: (t, keepContent) => t.type == typeText
			? new Token('static', keepContent ? t.content : escapeHtml(t.content))
			: t,
	}),
	// Formatted links
	formattedLinks,
	// Inline links
	inlineLinks,
	// Em
	textStyle(/\b_/m, /_\b/m, opt => opt.em && opt.em.start || token_em_start, opt => opt.em && opt.em.end || token_em_end),
	// Strong
	textStyle(/(?=^|[^\w])\*\*/m, /\*\*(?=$|[^\w])/m, opt => opt.strong && opt.strong.start || token_strong_start, opt => opt.strong && opt.strong.end || token_strong_end),
	// Strikethrough
	textStyle(/(?=^|[^\w])~~/m, /~~(?=$|[^\w])/m, opt => opt.strikethrough && opt.strikethrough.start || token_strikethrough_start, opt => opt.strikethrough && opt.strikethrough.end || token_strikethrough_end),
	// OOC
	textStyle(/(?=^|[^\w])\(\(/m, /\)\)(?=$|[^\w])/m, opt => opt.ooc && opt.ooc.start || token_ooc_start, opt => opt.ooc && opt.ooc.end || token_ooc_end),
	// Superscript / subscript
	textStyle(
		/(?:\+\+|--)/m,
		m => m[0] == '++' ? /\+\+/m : /--/m,
		(opt, start, end) => start.match[0] == '++' ? opt.sup && opt.sup.start || token_sup_start : opt.sub && opt.sub.start || token_sub_start,
		(opt, start, end) => end.match[0] == '++' ? opt.sup && opt.sup.end || token_sup_end : opt.sub && opt.sub.end || token_sub_end,
	),
	triggers,
	// Escape HTML characters
	escape,
];

const blockRules = {
	header: transformHeader,
	// table: function(tokens, idx, opt, keepContent) { },
};

/**
 * Takes an array of tokens (initially just a single 'text' token: [ new
 * Token(typeText, str, 0) ]) and applies formatting rules on it. Each rule may
 * modify the array of tokens as they see fit by updating tokens, splicing in
 * more tokens, or removing tokens.
 * @param {Array.<Token>} tokens Array of tokens.
 * @param {object} opt Parser options.
 * @param {boolean} keepContent If true, the content of each Token in the array
 * should contain the string characters they represent, so that tokens.join(t =>
 * t.content) would produce the initial string.
 */
function parseTokens(tokens, opt, keepContent) {
	opt = opt || defaultOpt;
	for (let rule of rules) {
		rule(tokens, opt, keepContent);
	}
}

/**
 * Goes through the tokens to find any typeText token with content matching the
 * regexp, ex.
 * @param {Array.<Token>} tokens Array of tokens.
 * @param {RegExp} re Regular expression to match against.
 * @param {object} [opts] Options
 * @param {number} [opts.idx] Token idx to start search from. Defaults to 0.
 * @param {number} [opts.pos] Content position/offset to start search from within the token. Defaults to 0.
 * @param {((token: Token) => boolean) | null} [opts.validToken] Callback to tell if a token is valid. If the function returns false, findInTokens will return null. telling if search should be limited to the inital token defined by opts.idx.
 * @param {number | null} [opts.level] Required level of token to match inside. If a token is encountered with lower level than opts.level, null is returned.
 * Defaults to null, which means all levels are matched against.
 * @returns {TokenMatch | null} An token match object or null if no match is found.
 */
function findInTokens(tokens, re, opts) {
	let { idx, pos, validToken, level } = Object.assign({ idx: 0, pos: 0, validToken: null, level: null }, opts);

	for (let i = idx, l = tokens.length; i < l; i++) {
		let token = tokens[i];
		if (validToken && !validToken(token)) {
			return null;
		}
		if (token.type == typeText) {
			if (level != null && token.level < level) {
				return null;
			}
			if (level == null || token.level == level) {
				let match = matchTextToken(token, re, pos);
				if (match) {
					return { match, offset: pos, idx: i, token };
				}
			}
		}
		pos = 0;
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
	let endRegexFactory = typeof endRegex == 'function' ? endRegex : () => endRegex;
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
			let end = findInTokens(tokens, endRegexFactory(start.match), { idx: start.idx, pos: offset + 1, level: start.token.level, validToken: config?.validToken });
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
				startToken(opt, start, end),
				endToken(opt, start, end),
				keepContent,
				config?.processInner,
			);
			idx = end.idx + 4;
			pos = 0;
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

function escape(tokens, opt, keepContent) {
	if (!keepContent) {
		for (let t of tokens) {
			if (t.type == typeText) {
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
		if (token.type == typeText) {
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
	increaseLevel(tokens, start.idx + 1, end.idx + 3, keepContent, processInner);
}

function increaseLevel(tokens, startIdx, endIdx, keepContent, processInner) {
	for (let i = startIdx, e = endIdx; i < e; i++) {
		let t = tokens[i];
		if (t.type == typeText) {
			t.level++;
		}
		if (processInner && i != startIdx && i != endIdx) {
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
	tokens.splice(
		idx,
		1,
		new Token(typeText, t.content.slice(0, start), t.level),
		keepContent ? new Token(token.type, t.content.slice(start, end), token.level) : token,
		new Token(typeText, t.content.slice(end), t.level),
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
				new Token('link_start'),
				new Token('link_end'),
				true,
				t => { t.type = 'link'; },
			);
			spliceTextTokens(
				tokens,
				{ idx: start.idx, from: anchorFrom, to: anchorFrom + 1 },
				{ idx: start.idx, from: linkFrom - 1, to: linkFrom },
				new Token('anchor_start'),
				new Token('anchor_end'),
				true,
				t => { t.type = 'anchor'; },
			);
			idx = start.idx + 7;
		} else {
			let escapedUrl = escapeHtml(link.url);
			spliceTextToken(
				tokens,
				start.idx,
				matchOffset(start, true),
				link.offset + link.url.length + end.index + end[0].length,
				new Token('anchor', '<a href="' + escapedUrl + '" target="_blank" rel="noopener noreferrer" title="' + escapedUrl + '">' + escapeHtml(start.match[1]) + '</a>'),
				keepContent,
			);
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
		if (token.type == typeText) {
			let link = findLinkInToken(token, pos, false, true);
			if (link) {
				let escapedUrl = escapeHtml(link.url);
				spliceTextToken(
					tokens,
					idx,
					link.offset,
					link.offset + link.url.length,
					new Token('anchor', '<a href="' + escapedUrl + '" target="_blank" rel="noopener noreferrer" title="' + escapedUrl + '">' + escapedUrl + '</a>'),
					keepContent,
				);
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

/**
 * Searches for the index after the last text token of the line.
 * New lines are defined by br tokens and other line tokens.
 * @param {Array.<Token>} tokens Array of tokens.
 * @param {number} idx Token index to start searching from.
 */
function lineEndTokenIdx(tokens, idx) {
	while (idx < tokens.length) {
		if (idx > 0) {
			if (tokens[idx].type == typeBr && tokens[idx - 1].type == typeText) {
				return idx;
			}
		}
		idx++;
	}
	return tokens.length;
}

function transformBlocks(tokens, opt, keepContent) {
	if (opt?.mode != modeDescription) {
		return;
	}

	let idx = 0;
	while (idx < tokens.length) {
		if (idx === null) {
			return;
		}
		let endIdx = lineEndTokenIdx(tokens, idx);

		let result = transformBlockSpan(tokens, idx, endIdx, opt, keepContent);
		idx = (result ? result.endIdx : endIdx) + 1;
	}
}

/**
 * Transform the block level rules inside a token span defined by startIdx and
 * endIdx.
 * @param {Array.<Token>} tokens Array of tokens.
 * @param {number} startIdx Index of start token for the span.
 * @param {number} endIdx Index of end token for the span.
 * @param {object} opt Parser options.
 * @param {boolean} keepContent If true, the content of each Token in the array
 * should contain the string characters they represent, so that tokens.join(t =>
 * t.content) would produce the initial string.
 * @returns {{ startIdx: number, endIdx: number } | null} New startIdx and endIdx for the span. If no transformation occurred, null is returned.
 */
function transformBlockSpan(tokens, startIdx, endIdx, opt, keepContent) {
	for (let ruleId in blockRules) {
		let rule = blockRules[ruleId];
		let result = rule(tokens, startIdx, endIdx, opt, keepContent);
		if (result) {
			return result;
		}
	}
	return null;
}

function countConsecutiveBr(tokens, idx, max) {
	let count = 0;
	for (let i = idx; i < tokens.length; i++) {
		if (tokens[i].type != typeBr) {
			break;
		}
		count++;
		if (max && count >= max) {
			break;
		}
	}
	return count;
}

/**
 * Transform the header block level rule inside a token span defined by startIdx
 * and endIdx.
 * @param {Array.<Token>} tokens Array of tokens.
 * @param {number} startIdx Index of start token for the span.
 * @param {number} endIdx Index of end token for the span.
 * @param {object} opt Parser options.
 * @param {boolean} keepContent If true, the content of each Token in the array
 * should contain the string characters they represent, so that tokens.join(t =>
 * t.content) would produce the initial string.
 * @returns {{ startIdx: number, endIdx: number } | null} New startIdx and
 * endIdx for the span. If no transformation occurred, null is returned.
 */
function transformHeader(tokens, startIdx, endIdx, opt, keepContent) {
	let token = tokens[startIdx];
	if (token.type != typeText) {
		return null;
	}

	let match = matchTextToken(token, /^\s*(#+)\s*/, 0);
	if (!match) {
		return null;
	}

	token.content = token.content.slice(match[0].length);
	let consumeBefore = tokens[startIdx - 1]?.type == 'br' ? 1 : 0;
	let consumeAfter = countConsecutiveBr(tokens, endIdx, 2);
	let [ startToken, endToken ] = match[1].length == 1
		? [ token_h1_start, token_h1_end ]
		: match[1].length == 2
			? [ token_h2_start, token_h2_end ]
			: [ token_h3_start, token_h3_end ];
	tokens.splice(endIdx, consumeAfter, endToken);
	tokens.splice(startIdx - consumeBefore, consumeBefore, keepContent ? new Token(startToken.type, match[0].length) : startToken);

	// Calculate new startIdx and endIdx
	startIdx = startIdx - consumeBefore;
	endIdx = endIdx + 1 - consumeBefore;
	// Increase level of all text tokens in between
	increaseLevel(tokens, startIdx + 1, endIdx, keepContent);

	// The new startIdx and endIdx includes the added <hX> and </hX> tags.
	return { startIdx, endIdx };
}
