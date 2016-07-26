# keeex-api.js

An asynchronous client library for the KeeeX local API

## Installation

	npm install keeex-api

## Quick start
You'll need the latest version of KeeeX (>3.1). You'll have to open the plugin manager (CTRL+T) to activate the local API.
Then you'll have to request a token. It will prompt the user if whether or not he allows the access to the API.

```js
var kxapi = require('keeex-api');

kxapi.getToken("APP Name", function(err, resp){
	if(!err){
		console.log("Successfully authorized to access keeex :)");
		// Now you can do whatever you want to
	}
});

```

## Need help ?
You can take a look to the docs.
You can also look the source code of plugins we wrote for keeex that will be released soon :)


