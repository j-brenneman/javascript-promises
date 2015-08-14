var db = require('monk')('localhost/stocks-example')
var Post = db.get('posts')
var Comment = db.get('comments')

// delete all posts and
// then insert a post and
// then close the database connection with db.close()

Post.remove({}).then(function () {
  return Post.insert({post: 'Hello'})
}).then(function (posts) {
  console.log(posts);
  db.close()
})
