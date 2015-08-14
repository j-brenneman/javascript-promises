var db = require('monk')('localhost/javascript-promises-examples')

var users = db.get('users')

users.remove({}).then(function () {
  users.insert({name: 'Joe'})
}).then(function () {
  users.insert({name: 'Sue'})
}).then(function () {
  users.insert({name: 'Tim'})
}).then(function () {
  users.inset({name: 'Kim'})
}).then(function () {
  return users.find({})
}).then(function (user) {
  console.log(user)
}).then(function () {
  db.close();
})


// users.remove({}).then(function () {
//   return users.insert({name: 'Joe'})
// }).then(function () {
//   return users.insert({name: 'Sue'})
// }).then(function (records) {
//   console.log(records);
//   db.close()
// })



  // users.insert({name: 'Joe'}, function (err, result) {
  //   users.insert({name: 'Sue'}, function (err, result) {
  //     users.insert({name: 'Tim'}, function (err, result) {
  //       users.insert({name: 'Kim'}, function (err, result) {
  //         users.find({}, function (err, results) {
  //           console.log("\nSuccess! The records are: \n");
  //           console.log(results);
  //           db.close()
  //         })
  //       })
  //     })
  //   })
  // })
