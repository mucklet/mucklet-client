export let keyRegex = /^[_\p{L}\p{N}\s-]*[_\p{L}\p{N}-]/u;
export let keyTokenRegex = /^([_\p{L}\p{N}\s-]*[_\p{L}\p{N}-])\s*/u;
export let keyExpandRegex = { left: /[_\p{L}\p{N}\s-]/u, right: /[_\p{L}\p{N}\s-]/u };

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
