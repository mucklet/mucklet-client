// Regex used for TokenList or other similar lists.

// Used to describe valid characters when creating new keys.
export let keyRegex = /^[\p{L}\p{N}\s'-]*[\p{L}\p{N}'-]/u;
// Used when typing in a key. May be more generous, but excludes delimiters.
export let keyTokenRegex = /^([^:=]*[^:=\s])\s*/u;
// Used during tab completion to expand the affected selection.
export let keyExpandRegex = { left: /./u, right: /[^:=]/u };

export let tagRegex = /^\s*(?:[^\p{C}\p{M}\p{P}\p{Z}\u115F\u1160\u3164|=,:;&%!?~+*/-]|['"#().])(?:(?:[^\p{C}\p{M}\p{P}\p{Z}\u115F\u1160\u3164|=,:;]|[\s&%!?~+*/'"#().-])*(?:[^\p{C}\p{M}\p{P}\p{Z}\u115F\u1160\u3164|=,:;]|[&%!?~+*/'"#().-]))?/u;
export let tagTokenRegex = /^([^:=]*[^:=\s])\s*/u;
export let tagExpandRegex = { left: /./u, right: /[^:=]/u };

export let colonDelimTokenRegex = /^([^:]*[^\s:])\s*/;
export let colonDelimExpandRegex = { left: /./, right: /[^:]/ };

export let equalDelimTokenRegex = /^([^=]*[^\s=])\s*/;
export let equalDelimExpandRegex = { left: /./, right: /[^=]/ };

export let colonEqualDelimTokenRegex = /^([^:=]*[^\s:=])\s*/;
export let colonEqualDelimExpandRegex = { left: /./, right: /[^:=]/ };

export let anyTokenRegex = /^(.*[^\s])\s*/;
export let anyExpandRegex = { left: /./, right: /./ };

export function escapeRegex(str) {
	return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};
