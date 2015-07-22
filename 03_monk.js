var db = require('monk')('localhost/javascript-promises-examples')
var users = db.get('users')
var messages = db.get('messages')

messages.remove({}).then(function () {
  return users.remove({})
}).then(function () {
  return users.insert({name: 'Joe'})
}).then(function (joe) {
  return messages.insert({senderId: joe._id})
}).then(function (message) {
  console.log("Message was inserted!", message);
  db.close()
})
