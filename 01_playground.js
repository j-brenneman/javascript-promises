var db = require('monk')('localhost/javascript-promises-examples')
var users = db.get('users')
