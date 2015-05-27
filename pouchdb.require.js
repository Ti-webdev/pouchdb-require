(function (moduleSandbox) {
  var dirname = function (path) {
    return path.replace(/\/?[^\/]+$/, '')
  }

  var defineModule = function (db, doc, id) {
    var idArr = id.split('/')
    var body = doc
    while(idArr.length) {
      var pathName = idArr.shift()
      body = body[pathName]
      if (!body) {
        throw new Error('Path ' + JSON.stringify(path) + ' not found in document ' + JSON.stringify(doc._id))
      }
    }

    var globals = {
      exports: {},
      module: {},
      require: function(child) {
        var parent = globals.module
        var childArr = child.split('/')
        var childId = ''
        for(var i = 0; i < childArr.length; i++) {
          var pathName = childArr[i]
          if ('' !== childId) {
            childId += '/'
          }
          switch(pathName) {
            case '.':
              if ('' === childId) {
                childId = dirname(parent.id)
              }
              break
            case '..':
              if ('' === childId) {
                childId = dirname(parent.id)
              }
              childId = dirname(childId)
              break
            default:
              childId += pathName
          }
        }

        return defineModule(db, doc, childId, globals.module).exports
      }
    }
    globals.globals = globals
    globals.module.id = id
    globals.module.require = globals.require
    globals.module.exports = globals.exports
    globals.module.current = globals.module
    if (parent) {
      globals.module.parent = parent
    }

    var keys = Object.keys(globals)
    var i = keys.length
    var args = new Array(i)
    for(i--; 0 <= i; i--) {
      args[i] = globals[keys[i]]
    }
    moduleSandbox(keys.join(','), body, globals.exports, args)
    return globals.module
  }

  if ('undefined' === typeof exports) {
    exports = {}
  }

  exports.require = function(id, path, cb) {
    var db = this
    var result = db.get(id)
      .then(function (doc) {
        return defineModule(db, doc, path).exports
      })
    if (cb) {
      result.then(function(exports) {
        cb(null, exports)
      }, cb)
    }
    return result
  }

  if (PouchDB) {
    PouchDB.plugin(exports)
  }
})(function() {
  (new Function(arguments[0], 'arguments = undefined\n' + arguments[1])).apply(arguments[2], arguments[3])
})
