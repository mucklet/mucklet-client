#!/usr/bin/env node

/**
 * Reports SCSS selector classes that do not occur in the JavaScript files of
 * the module that owns the SCSS file.
 *
 * Usage: node scripts/scanunusedcss.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const sourceRoot = path.join(projectRoot, 'src');
const classNameChar = /[A-Za-z0-9_-]/;

/**
 * Recursively get every file under a directory.
 *
 * @param {string} dir Directory to read.
 * @returns {string[]} File paths.
 */
function getFiles(dir) {
	let entries = fs.readdirSync(dir, { withFileTypes: true });
	let files = [];

	for (let entry of entries) {
		let file = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...getFiles(file));
		} else if (entry.isFile()) {
			files.push(file);
		}
	}

	return files;
}

/**
 * Remove comments so commented-out styles are not reported as live classes.
 *
 * @param {string} source SCSS source.
 * @returns {string} SCSS without comments.
 */
function removeComments(source) {
	return source
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/(^|[^:])\/\/.*$/gm, '$1');
}

/**
 * Get classes written explicitly in a selector.
 *
 * @param {string} selector Selector text.
 * @returns {string[]} Class names.
 */
function getExplicitClasses(selector) {
	let classes = [];
	let match;
	let classPattern = /\.([A-Za-z_-][A-Za-z0-9_-]*)/g;

	while ((match = classPattern.exec(selector))) {
		if (selector.slice(classPattern.lastIndex, classPattern.lastIndex + 2) !== '#{') {
			classes.push(match[1]);
		}
	}

	return classes;
}

/**
 * Get classes represented by an SCSS selector, resolving simple parent (`&`)
 * selectors using classes from its nearest selector ancestor.
 *
 * @param {string} selector Selector text.
 * @param {string[]} parentClasses Classes from the parent selector.
 * @returns {string[]} Class names.
 */
function getSelectorClasses(selector, parentClasses) {
	let classes = getExplicitClasses(selector);
	let parentSuffixPattern = /&([A-Za-z_-][A-Za-z0-9_-]*)/g;
	let match;

	while ((match = parentSuffixPattern.exec(selector))) {
		if (selector.slice(parentSuffixPattern.lastIndex, parentSuffixPattern.lastIndex + 2) === '#{') {
			continue;
		}

		for (let parentClass of parentClasses) {
			classes.push(parentClass + match[1]);
		}
	}

	return [ ...new Set(classes) ];
}

/**
 * Extract classes from SCSS selectors. This intentionally handles the common
 * nesting pattern `.block { &--element { ... } }` without trying to be a full
 * SCSS parser.
 *
 * @param {string} source SCSS source.
 * @returns {string[]} Class names.
 */
function getScssClasses(source) {
	let classes = new Set();
	let stack = [];
	let header = '';
	let inString = null;
	let sourceWithoutComments = removeComments(source);

	for (let i = 0; i < sourceWithoutComments.length; i++) {
		let character = sourceWithoutComments[i];

		if (inString) {
			header += character;
			if (character === inString && sourceWithoutComments[i - 1] !== '\\') {
				inString = null;
			}
			continue;
		}

		if (character === '"' || character === "'") {
			inString = character;
			header += character;
			continue;
		}

		if (character === '{') {
			let selector = header.trim();
			let parentClasses = stack.length ? stack[stack.length - 1].classes : [];
			let selectorClasses = selector.startsWith('@')
				? []
				: getSelectorClasses(selector, parentClasses);

			for (let className of selectorClasses) {
				classes.add(className);
			}

			stack.push({ classes: selectorClasses.length ? selectorClasses : parentClasses });
			header = '';
			continue;
		}

		if (character === '}') {
			stack.pop();
			header = '';
			continue;
		}

		if (character === ';') {
			header = '';
			continue;
		}

		header += character;
	}

	return [ ...classes ].sort();
}

/**
 * Check whether a whole CSS class name occurs in JavaScript source.
 *
 * @param {string} className CSS class name.
 * @param {string} source JavaScript source.
 * @returns {boolean} Whether the class is found.
 */
function isUsedInJavaScript(className, source) {
	let offset = source.indexOf(className);

	while (offset !== -1) {
		let before = source[offset - 1];
		let after = source[offset + className.length];

		if ((!before || !classNameChar.test(before)) && (!after || !classNameChar.test(after))) {
			return true;
		}

		offset = source.indexOf(className, offset + className.length);
	}

	return false;
}

/**
 * Whether this SCSS file belongs to a module with a same-named JavaScript
 * entry file. The comparison is case-insensitive, as SCSS names are normally
 * lower camel case while module classes are PascalCase.
 *
 * @param {string} scssFile SCSS file path.
 * @returns {boolean} Whether this is a module stylesheet.
 */
function isModuleStylesheet(scssFile) {
	let dir = path.dirname(scssFile);
	let scssBaseName = path.basename(scssFile, '.scss').toLowerCase();

	return fs.readdirSync(dir, { withFileTypes: true }).some(entry =>
		entry.isFile()
		&& path.extname(entry.name) === '.js'
		&& path.basename(entry.name, '.js').toLowerCase() === scssBaseName,
	);
}

function main() {
	let scssFiles = getFiles(sourceRoot)
		.filter(file => path.extname(file) === '.scss')
		.filter(file => file.split(path.sep).includes('modules'))
		.filter(isModuleStylesheet)
		.sort();
	let findings = [];

	for (let scssFile of scssFiles) {
		let moduleDir = path.dirname(scssFile);
		let javaScript = fs.readdirSync(moduleDir, { withFileTypes: true })
			.filter(entry => entry.isFile() && path.extname(entry.name) === '.js')
			.map(entry => fs.readFileSync(path.join(moduleDir, entry.name), 'utf8'))
			.join('\n');
		let unusedClasses = getScssClasses(fs.readFileSync(scssFile, 'utf8'))
			.filter(className => !isUsedInJavaScript(className, javaScript));

		if (unusedClasses.length) {
			findings.push({
				file: path.relative(projectRoot, scssFile),
				classes: unusedClasses,
			});
		}
	}

	if (!findings.length) {
		console.log(`No potentially unused classes found in ${scssFiles.length} module stylesheet(s).`);
		return;
	}

	console.log(`Potentially unused classes in ${findings.length} of ${scssFiles.length} module stylesheet(s):`);
	for (let finding of findings) {
		console.log(`\n${finding.file}`);
		for (let className of finding.classes) {
			console.log(`  ${className}`);
		}
	}
}

main();
