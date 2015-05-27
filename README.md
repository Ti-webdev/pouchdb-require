PouchDB require() plugin
=====

Usage
-----

To use this plugin, include it after `pouchdb.js` in your HTML page:

```html
<script src="pouchdb.js"></script>
<script src="pouchdb.require.js"></script>
```

This plugin is also available from Bower:

```
bower install pouchdb-require
```

Or to use it in Node.js, just npm install it:

```
npm install pouchdb-require
```

And then do this:

```js
var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-require'))
```

API
-----

```js
db.require('_design/api', 'lib/date')
.then(function (date) {
  return date.stringify(new Date)
}).catch(function (err) {
  // handle err
});
```
