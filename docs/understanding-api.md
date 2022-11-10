# Understanding the API

The API used by Mucklet Client is a real time API over WebSocket provided by a [Resgate API gateway](https://resgate.io) server.  It allows the client to fetch resources (Models and Collections, as explained in [Understanding events](./understanding-events.md)), and listen for real time updates on them.

You can read more about how to use [ResClient](https://github.com/resgateio/resclient), the javascript library used to access the API, [here](https://resgate.io/docs/writing-clients/resclient/).

## API module

The API is primarily accessed through the `api` module.

You can use it to _get_ resources:

```javascript
// Use the api module to get the core.info model resource from the server,
// listening for changes to the API version.
app.getModule('api').get('core.info').then(info => {
	info.on('change', (changed) => {
		if (changed.hasOwnProperty('version')) {
			console.log("Version changed from " + changed.version + " to " + info.version);
		}
	});
});
```

And you can use it to _call_ methods:
```javascript
// Call an API method that returns the logged in user's roles.
app.getModule('api').call('core', 'getRoles').then(roles => {
	console.log("Player roles:", roles);
});
```

## Player module

Most of the times, you don't have to use the `api` module directly. Instead you can use the API resources fetch by other module.

The `player` module holds player related resources from the API, such as owned characters and controlled characters. Through the controlled characters, you can also get access to info on the room they are in, or who they are looking at.

```javascript
// Use the player module to make your currently active character say, "Hello".
app.getModule('player').getActiveChar().call('say', {
	msg: "Hello",
});
```
