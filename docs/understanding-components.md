# Understanding components

Components are graphical elements that can render themselves inside a DOM
element. A component is defined by [a tiny
interface](https://github.com/jirenius/modapp/blob/master/docs/docs.md#Component).  
In essense, a component must have a `render` method and an `unrender` method:

```javascript
let span = document.createElement('h1');
span.textContent = "Hello, world!";
span.render = e => e.appendChild(span);
span.unrender = () => span.parentElement.removeChild(span);
```
It can be rendered:
```javascript
span.render(document.body);
```
and unrendered:
```javascript
span.unrender();
```

## Modapp base components

While the components system is just a simple interface, without any
dependencies, a set of component classes has been used to simplify the creation
of components.

Below is a few examples of some of them.

### Txt

Renders a text.

```javascript
import { Txt } from 'modapp-base-component';

let txt = new Txt("Hello, world!", { tagName: 'h1' });
txt.render(document.body);
```

Renders:
```html
<h1>Hello, world!</h1>
```

See [Txt.js](https://github.com/jirenius/modapp-base-component/blob/master/src/Txt.js) for usage.

### Elem

Renders a DOM structure that may contain subcomponents.

```javascript
import { Elem, Txt } from 'modapp-base-component';

let elem = new Elem(n => n.elem('ul', { className: 'example' }, [
	n.elem('li', [
		n.text("First item"),
	]),
	n.elem('li', [
		n.component(new Txt("Second item")),
	]),
]));
elem.render(document.body);
```

Renders:
```html
<ul class="example">
	<li>First item</li>
	<li>
		<span>Second item</span>
	</li>
</ul>
```
See [Elem.js](https://github.com/jirenius/modapp-base-component/blob/master/src/Elem.js) for usage.

### Context

A component wrapper that creates a context on render, which can be properly
disposed on unrender.

```javascript
import { Context, Txt } from 'modapp-base-component';

let txt = new Context(
	// Called prior to render
	context => setTimeout(() => context.getComponent()?.setText("Timeout!"), 5000),
	// Called after unrender with the value returned above
	timeoutId => clearTimeout(timeoutId).removeEventListener('resize', onResize),
	// Called on render with the value returned above
	timeoutId => new Txt("ID: " + timeoutId),
);
txt.render(document.body);
```

Renders initially:
```html
<span>ID: 1</span>
```

After 5 seconds, it changes to:
```html
<span>Timeout!</span>
```

See [Context.js](https://github.com/jirenius/modapp-base-component/blob/master/src/Context.js) for usage.

## Modapp Resource Components

Resource components are components that starts listening to events on [Models](./understanding-events.md#models) or
[Collections](./understanding-events.md#collections) on render, updating themselves on events, and stops listening on
unrender.

### ModelTxt

Renders a text based on a model, and updates that text on model change.

```javascript
import { Model } from 'modapp-resource';
import { ModelTxt } from 'modapp-resource-component';

let model = new Model({ data: { place: "world" }});
let txt = new ModelTxt(model, m => "Hello, " + m.place + "!", { tagName: 'h1' });
txt.render(document.body);

setTimeout(() => model.set({ place: "Mucklet" }), 5000);
```

Renders initially:
```html
<h1>Hello, world!</h1>
```

After 5 seconds, the model is updated, which updates the text to:
```html
<h1>Hello, Mucklet!</h1>
```


### CollectionList

Renders a list of items based on a collection.

```javascript
import { Txt } from 'modapp-base-component';
import { Collection } from 'modapp-resource';
import { CollectionList } from 'modapp-resource-component';

let collection = new Collection({ data: [
	{ id: 10, greeting: "Hello" },
	{ id: 20, greeting: "Hejsan" },
] });
let list = new CollectionList(collection, item => new Txt(item.greeting));
list.render(document.body);

setTimeout(() => collection.add({ id: 30, greeting: "こんにちは" }), 5000);
```

Renders initially:
```html
<div>
	<div><span>Hello</span></div>
	<div><span>Hejsan</span></div>
</div>
```

After 5 seconds, the collection is updated, which animates in a new item:
```html
<div>
	<div><span>Hello</span></div>
	<div><span>Hejsan</span></div>
	<div><span>こんにちは</span></div>
</div>
```

See [CollectionList.js](https://github.com/jirenius/modapp-resource-component/blob/master/src/CollectionList.js) for usage.

## ModelComponent

A generic component wrapper that listens to change events on a model, calling
update on change.

```javascript
import { Txt } from 'modapp-base-component';
import { Model } from 'modapp-resource';
import { ModelComponent } from 'modapp-resource-component';

let model = new Model({ data: { color: "#F00" }});
let txt = new ModelComponent(
	model,                                  // Model to listen to
	new Txt("Colored"),                     // Component to render
	(m, c) => c.setStyle('color', m.color), // Callback called before render and on model update
);
txt.render(document.body);

setTimeout(() => model.set({ color: "#0F0" }), 5000);
```

Renders initially:
```html
<span style="color:#F00">Colored</span>
```

After 5 seconds, the model is updated, which updates the style to:
```html
<span style="color:#0F0">Colored</span>
```

See [ModelComponent.js](https://github.com/jirenius/modapp-resource-component/blob/master/src/ModelComponent.js) for usage.
