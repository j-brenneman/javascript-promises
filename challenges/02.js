
var db = require('monk')('localhost/stocks-example')
var Post = db.get('posts')
var Comment = db.get('comments')

// delete all posts and
// then insert a post and
// then insert another post and
// then console.log the second post that was created
// then close the database connection with db.close()

Post.remove({}).then(function () {
  return Post.insert({one: 1}).then(function () {
    return Post.insert({two: 2})
  }).then(function (post) {
    return Post.findOne({_id: post._id})
  }).then(function (post) {
    console.log(post);
  })
}).then(function () {
  db.close()
})
