/**
 * Functions that parses and formats text in a similar way as markdown.
 *
 * [TODO] While starting simple at first, the functionality has grown large and
 * too complex. This should be rewritten with a proper tokenizer/lexer. /Acci
 */

import escapeHtml from './escapeHtml.js';

const defaultOpt = {};

function keySort(a, b) {
	return a.key.localeCompare(b.key);
}

const typeText = 'text';
const typeBr = 'br';
const typeStatic = 'static';

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

	withContent(content, keepContent) {
		return keepContent
			? new Token(this.type, content, this.level)
			: this;
	}

	clone() {
		return new Token(this.type, this.content, this.level);
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
const token_h1_start = new Token('h1_start', '<h1>', 0);
const token_h1_end = new Token('h1_end', '</h1>', 0);
const token_h2_start = new Token('h2_start', '<h2>', 0);
const token_h2_end = new Token('h2_end', '</h2>', 0);
const token_h3_start = new Token('h3_start', '<h3>', 0);
const token_h3_end = new Token('h3_end', '</h3>', 0);
const token_nobr_start = new Token('nobr_start', '<span class="nobr">');
const token_nobr_end = new Token('nobr_end', '</span>');
const token_esc_start = new Token('esc_start', '');
const token_esc_end = new Token('esc_end', '');
const token_codeblock_start = new Token('codeblock_start', '<div class="codeblock">', 0);
const token_codeblock_end = new Token('codeblock_end', '</div>', 0);
// Table
const token_table_start = new Token('table_start', '<table>', 0);
const token_table_end = new Token('table_end', '</table>', 0);
const token_thead_start = new Token('thead_start', '<thead>', 0);
const token_thead_end = new Token('thead_end', '</thead>', 0);
const token_tbody_start = new Token('tbody_start', '<tbody>', 0);
const token_tbody_end = new Token('tbody_end', '</tbody>', 0);
const token_tr_start = new Token('tr_start', '<tr>', 0);
const token_tr_end = new Token('tr_end', '</tr>', 0);
const token_th_start = new Token('th_start', '<th>', 0);
const token_th_end = new Token('th_end', '</th>', 0);
const token_td_start = new Token('td_start', '<td>', 0);
const token_td_end = new Token('td_end', '</td>', 0);

export const oocNoParenthesis = { start: token_ooc_start_noparenthesis, end: token_ooc_end_noparenthesis };

const rules = [
	// Line breaks
	textReplace(/\n/m, (m, opt) => token_br),
	// Blocks (see blockRules)
	transformBlocks,
	// Escape
	textStyle(/<esc>/m, /<\/esc>/m, opt => opt.esc && opt.esc.start || token_esc_start, opt => opt.esc && opt.esc.end || token_esc_end, {
		validToken: token => token.type == typeText || token.type == typeBr,
		processInner: (t, keepContent) => t.type == typeText
			? new Token(typeStatic, keepContent ? t.content : escapeHtml(t.content))
			: t,
	}),
	// Cmd
	textStyle(/(?=^|[^\w])`/m, /`(?=$|[^\w])/m, opt => opt.cmd && opt.cmd.start || token_cmd_start, opt => opt.cmd && opt.cmd.end || token_cmd_end, {
		validToken: token => token.type == typeText || token.type == typeBr,
		processInner: (t, keepContent) => t.type == typeText
			? new Token(typeStatic, keepContent ? t.content : escapeHtml(t.content))
			: t,
	}),
	// Formatted links
	formattedLinks,
	// Inline links
	inlineLinks,
	// No breaking
	textStyle(/<nobr>/m, /<\/nobr>/m, opt => opt.nobr && opt.nobr.start || token_nobr_start, opt => opt.nobr && opt.nobr.end || token_nobr_end),
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
	// Code blocks
	codeblock: transformCodeBlock,
	// Headers
	header: transformHeader,
	// Tables
	table: transformTable,
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
		if ((validToken && !validToken(token)) || (level != null && token.level != null && token.level < level)) {
			return null;
		}
		if (token.type == typeText) {
			let match = matchTextToken(token, re, pos);
			if (match) {
				return { match, offset: pos, idx: i, token };
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
						spliceTextToken(tokens, idx, txtIdx, txtIdx, Object.assign(token_highlight_start.clone(), { trigger }), keepContent);
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
	if (!token.withContent) {
		console.log(token);
	}
	tokens.splice(
		idx,
		1,
		new Token(typeText, t.content.slice(0, start), t.level),
		token.withContent(t.content.slice(start, end), keepContent),
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

function countConsecutiveBr(tokens, idx, max, dir) {
	let count = 0;
	if (max > 0) {
		for (let i = idx; i >= 0 && i < tokens.length; i += dir) {
			let token = tokens[i];
			if (token.type == typeBr) {
				count = Math.abs(i + dir - idx);
				if (count >= max) {
					break;
				}
			} else if (token.type != typeText || token.content.trim()) {
				break;
			}
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
	let consumeBefore = countConsecutiveBr(tokens, startIdx - 1, 2, -1);
	let consumeAfter = countConsecutiveBr(tokens, endIdx, 2, 1);

	let afterContent = tokens.slice(endIdx, endIdx + consumeAfter).map(t => t.content).join('');
	let [ startToken, endToken ] = match[1].length == 1
		? [ token_h1_start, token_h1_end ]
		: match[1].length == 2
			? [ token_h2_start, token_h2_end ]
			: [ token_h3_start, token_h3_end ];
	tokens.splice(endIdx, consumeAfter, endToken.withContent(
		afterContent,
		keepContent,
	));
	tokens.splice(startIdx - consumeBefore, consumeBefore, startToken.withContent(
		tokens.slice(startIdx - consumeBefore, startIdx).map(t => t.content).join('') + match[0],
		keepContent,
	));

	// Calculate new startIdx and endIdx
	startIdx = startIdx - consumeBefore;
	endIdx = endIdx + 1 - consumeBefore;
	// Increase level of all text tokens in between
	increaseLevel(tokens, startIdx + 1, endIdx, keepContent);

	// The new startIdx and endIdx includes the added <hX> and </hX> tags.
	return { startIdx, endIdx };
}

/**
 * Transform the table block level rule inside a token span defined by startIdx
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
function transformTable(tokens, startIdx, endIdx, opt, keepContent) {
	let headers = null;
	let rows = [];
	let idx = startIdx;
	let tableEndIdx;
	let nextRow = () => {
		tableEndIdx = lineEndTokenIdx(tokens, idx);
		idx = tableEndIdx + 1;
	};

	let columns = matchTableLine(tokens, idx);
	nextRow();

	// Check if next line is a columns line
	if (!columns && idx < tokens.length) {
		columns = matchTableLine(tokens, idx);
		if (columns) {
			headers = matchTableRow(tokens, startIdx, columns);
			nextRow();
		}
	}

	if (!columns) {
		return null;
	}

	while (idx < tokens.length) {
		let row = matchTableRow(tokens, idx, columns);
		if (!row) {
			break;
		}
		rows.push(row);
		nextRow();
	}

	let consumeBefore = countConsecutiveBr(tokens, startIdx - 1, 2, -1);
	let consumeAfter = countConsecutiveBr(tokens, tableEndIdx, 2, 1);


	let table = [
		// <table>
		token_table_start.withContent(
			tokens.slice(startIdx - consumeBefore, startIdx).map(t => t.content).join(''),
			keepContent,
		),
		// <thead>
		...(headers
			? [
				token_thead_start.withContent('', keepContent),
				...tableRowToTokens(tokens, columns, headers, token_th_start, token_th_end, token_th_start, token_th_end, false, keepContent),
				token_thead_end.withContent('', keepContent),
			]
			: []
		),
		// <tbody>
		token_tbody_start.withContent(tokens[columns.idx].content + (rows.length ? "\n" : ''), keepContent),
		...([].concat(...rows.map((row, i) => tableRowToTokens(
			tokens,
			columns,
			row,
			headers ? token_td_start : token_th_start,
			headers ? token_td_end : token_th_end,
			token_td_start,
			token_td_end,
			i == (rows.length - 1),
			keepContent,
		)))),
		token_tbody_end.withContent('', keepContent),
		// </table>
		token_table_end.withContent(
			tokens.slice(tableEndIdx, tableEndIdx + consumeAfter).map(t => t.content).join(''),
			keepContent,
		),
	];

	// Splice the table
	tokens.splice(startIdx - consumeBefore, consumeBefore + tableEndIdx - startIdx + consumeAfter, ...table);

	// Calculate new startIdx and endIdx
	startIdx = startIdx - consumeBefore;
	endIdx = startIdx + table.length - 1;

	return { startIdx, endIdx };
}

function matchTableLine(tokens, idx) {
	let token = tokens[idx];
	if (token.type != typeText) {
		return null;
	}

	let parts = token.content.split('|');
	let len = parts.length;

	let columns = [];
	for (let i = 0; i < len; i++) {
		let s = parts[i].trim();
		if (!s) {
			// Empty line. Not a match
			if (len == 1) {
				return null;
			}
			// Empty before first | or last |.
			if (i == 0 || i == len - 1) {
				continue;
			}
		}
		let match = s.match(/^([:-])-+([:-])$/);
		if (!match) {
			return null;
		}
		columns.push({
			align: match[2] == ':'
				? match[1] == ':'
					? 'center'
					: 'right'
				: 'left',
		});
	}

	return { idx, columns };
}

function matchTableRow(tokens, idx, columns) {
	let token = tokens[idx];
	if (token.type != typeText) {
		return null;
	}

	const columnCount = columns.columns.length;
	let content = token.content;
	let offset = 0;
	let start = 0;
	let cells = [];

	while (cells.length < columnCount) {
		let pipeFound = true;
		let end = content.indexOf('|', start);
		let nextStart = end + 1;
		if (end < 0) {
			end = content.length;
			nextStart = end;
			pipeFound = false;
		}
		let p = content.slice(start, end);
		let s = p.trimStart();
		let prefixLen = p.length - s.length;
		s = s.trimEnd();

		// If empty lineSkip empty line before the first pipe
		if (s || start > 0) {
			cells.push({
				content: s,
				prefix: content.slice(offset, start + prefixLen),
				suffix: cells.length == columnCount - 1 // Last column
					? content.slice(start + prefixLen + s.length)
					: content.slice(start + prefixLen + s.length, nextStart),
			});
			offset = nextStart;
		} else if (!pipeFound) {
			// Empty line without pipe means is not a row at all
			return null;
		}
		start = nextStart;
	}

	return { idx, cells };
}

function tableRowToTokens(tokens, columns, row, firstCellStartToken, firstCellEndToken, startToken, endToken, lastRow, keepContent) {
	let level = (tokens[row.idx].level || 0) + 1;
	return [
		token_tr_start.withContent('', keepContent),
		...[].concat(...columns.columns.map((col, i) => {
			let c = row.cells[i];
			let stoken = i == 0 ? firstCellStartToken : startToken;
			let etoken = i == 0 ? firstCellEndToken : endToken;
			return [
				stoken.withContent(c.prefix, keepContent),
				new Token(typeText, c?.content || '', level),
				etoken.withContent(c.suffix, keepContent),
			];
		})),
		token_tr_end.withContent(lastRow ? '' : '\n', keepContent),
	];
}

/**
 * Transform a code block.
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
function transformCodeBlock(tokens, startIdx, endIdx, opt, keepContent) {
	let idx = startIdx;
	let codeBlockEndIdx;
	let nextRow = () => {
		codeBlockEndIdx = lineEndTokenIdx(tokens, idx);
		idx = codeBlockEndIdx + 1;
	};

	let startLine = matchCodeBlockLine(tokens, idx);
	if (!startLine) {
		return false;
	}
	nextRow();

	 // The token idx where code starts, excluding the "```\n"
	let codeStartIdx = idx;
	// The token idx where code ends, excluding the "\n```"
	let codeEndIdx = null;

	let endLine = null;
	while (!endLine && idx < tokens.length) {
		codeEndIdx = codeBlockEndIdx;
		endLine = matchCodeBlockLine(tokens, idx);
		nextRow();
	}
	// Set code end idx. Make sure not to overlap with the codeStartIdx
	codeEndIdx = Math.max(codeStartIdx, endLine ? codeEndIdx : tokens.length);

	let consumeBefore = countConsecutiveBr(tokens, startLine.idx - 1, 2, -1);
	let consumeAfter = countConsecutiveBr(tokens, codeBlockEndIdx, 2, 1);

	let codeBlock = [
		token_codeblock_start.withContent(
			tokens.slice(startIdx - consumeBefore, codeStartIdx).map(t => t.content).join(''),
			keepContent,
		),

		...(tokens.slice(codeStartIdx, codeEndIdx).map(t => {
			return t.type == typeText
				? new Token(typeStatic, keepContent ? t.content : escapeHtml(t.content))
				: t;
		})),

		token_codeblock_end.withContent(
			tokens.slice(codeEndIdx, codeBlockEndIdx + consumeAfter).map(t => t.content).join(''),
			keepContent,
		),
	];

	// Splice the table
	tokens.splice(startIdx - consumeBefore, consumeBefore + codeBlockEndIdx - startIdx + consumeAfter, ...codeBlock);

	// Calculate new startIdx and endIdx
	startIdx = startIdx - consumeBefore;
	endIdx = startIdx + codeBlock.length - 1;

	return { startIdx, endIdx };
}

function matchCodeBlockLine(tokens, idx) {
	let token = tokens[idx];
	if (token.type != typeText) {
		return null;
	}

	let match = token.content.match(/^```/);
	if (!match) {
		return null;
	}

	return { idx };
}
