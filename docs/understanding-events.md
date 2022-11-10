# Understanding events

Events are almost entirely emitted through _models_ and _collections_.

## Models

_Models_ are objects that contain unordered key/value data, and implements the
[Model interface](https://github.com/jirenius/modapp/blob/master/docs/docs.md#Model).

The interface defines how we can add listeners using `on` and `off` methods, and
how properties may be accessed:
```javascript
import { Model } from 'modapp-resource';

// Create a model instance with two properties
let model = new Model({ data: { greeting: "Hello", _locale: "en" }});

// Create a callback function
function onChange(change) { console.log("Model changed: ", change); }

// Add a change listener to a model
model.on('change', onChange);

// Remove a change listener from a model
model.off('change', onChange);

// Access a model property
console.log(model.greeting);
// Output: Hello

// Access all model properties in most Model implementations.
console.log(Object.keys(model.props));
// Output: [ "greeting", "_locale" ]
```

> **Tip**
>
> While not defined as part of the interface, most model implementations also
provide a property called `props`, which returns an anonymous object with all
model properties, as shown in above example.

## Collections

_Collection_ are iterable lists that contain ordered values, and implements the
[Collection interface](https://github.com/jirenius/modapp/blob/master/docs/docs.md#Collection).

The interface defines how we can add listeners using `on` and `off` methods, and
how we can access values.
```javascript
import { Collection } from 'modapp-resource';

// Create a collection instance with two string values
let collection = new Collection({ data: [ "First", "Second" ], idAttribute: null });

// Create callback functions
function onAdd(ev) { console.log("Value added at index:", ev.idx); }
function onRemove(ev) { console.log("Value removed at index:", ev.idx); }

// Add a add/remove listeners to a collection
collection.on('add', onAdd);
collection.on('remove', onRemove);

// Remove a add/remove listeners from a collection
collection.off('add', onAdd);
collection.off('remove', onRemove);

// Get collection length
console.log(collection.length); // Output: 2

// Get collection value at index
console.log(collection.atIndex(1)); // Output: Second

// Iterate over a collection
for (let value of collection) {
	console.log(value); // Output: First Second
}
```

> **Tip**
>
> While not defined as part of the interface, most collection implementations
also provide a `toArray` method that returns copy of the internal list as an
anonymous array.

## EventBus

Models and collections communicate over an event bus held by the [app
instance](./understanding-modules.md#app-instance) passed to each module, but we
seldom really need to care about that. While it _is_ possible to listen to
events directly on the event bus, it should be avoided.

When creating new models/collectiona, you should (for now) pass the
`app.eventBus` instance to it:

```javascript
import { Model } from 'modapp-resource';
// Example module
class Example {
	constructor(app) {
		this.app = app;
		this.model = new Model({ data: { meaning: 42 }, eventBus: this.app.eventBus });
	}
}
```


## Model/Collection implementations

Above examples uses basic implementations found in the `modapp-resource` package:
```javascript
import { Model, Collection } from 'modapp-resource';
```

While these classes implements the _Model interface_ and _Collection interface_,
any object that fulfills the interface is considered a _model_ or a
_collection_. Here is a list of other implementations:

### API resources
All models/collections from the API implements the interfaces.

### CollectionWrapper
```javascript
import { CollectionWrapper } from 'modapp-resource';
```
 A wrapper for a collection, exposing the underlaying data but can provide a
 different sort order, mapping of items, filtering of items, or slicing of the
 collection. It will transparently propagate emitted add and remove events.

### ModifyModel
```javascript
import { ModifyModel } from 'modapp-resource';
```

ModifyModel transparently wraps another object or model, and sets its own
properties to the match the underlying one.

Any property modification that will cause a difference between the models will
set the additional property `isModified` to be true. It also listens to changes
in the underlying model. If a non-modified property is changed, the ModifyModel
will update its own property.

Useful for making edits to a remote model prior to saving.


