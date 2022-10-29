class Test {
	constructor(app, params) {
		this.app = app;
		this.app.require([], this._init.bind(this));
	}

	_init(module) {

	}

	_createDB() {
		// Let us open our database
		this.db = null;

		var DBOpenRequest = window.indexedDB.open("toDoList", 5);

		// these two event handlers act on the IDBDatabase object,
		// when the database is opened successfully, or not
		DBOpenRequest.onerror = function(event) {
			console.log('Error loading database.');
		};

		DBOpenRequest.onsuccess = function(event) {
			console.log('Database initialised.');

			// store the result of opening the database in the db
			// variable. This is used a lot later on
			this.db = DBOpenRequest.result;

			// Run the displayData() function to populate the task
			// list with all the to-do list data already in the IDB
			// displayData();
		};

		// This event handles the event whereby a new version of
		// the database needs to be created Either one has not
		// been created before, or a new version number has been
		// submitted via the window.indexedDB.open line above

		DBOpenRequest.onupgradeneeded = function(event) {
			console.log("Upgrading db: ", event);
			let db = event.target.result;

			db.onerror = function(event) {
				console.log('Error loading database.');
			};

			// Create an objectStore for this database using
			// IDBDatabase.createObjectStore

			let objectStore = db.createObjectStore("toDoList", { keyPath: "taskTitle" });

			// define what data items the objectStore will contain

			objectStore.createIndex("hours", "hours", { unique: false });
			objectStore.createIndex("minutes", "minutes", { unique: false });
			objectStore.createIndex("day", "day", { unique: false });
			objectStore.createIndex("month", "month", { unique: false });
			objectStore.createIndex("year", "year", { unique: false });

			objectStore.createIndex("notified", "notified", { unique: false });

			console.log('Object store created.');
		};
	}

	dispose() {
	}
}

export default Test;
