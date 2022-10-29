export default window.indexedDB ||
	window.mozIndexedDB ||
	window.webkitIndexedDB ||
	window.msIndexedDB;

export let IDBTransaction = window.IDBTransaction ||
	window.webkitIDBTransaction ||
	window.msIDBTransaction;

export let IDBKeyRange = window.IDBKeyRange ||
	window.webkitIDBKeyRange ||
	window.msIDBKeyRange;
